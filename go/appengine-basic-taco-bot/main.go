/**
 * Copyright 2018 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package main

import (
	"context"
	"encoding/json"
	"io"
	"io/ioutil"
	"net/http"
	"strings"

	"google.golang.org/api/chat/v1"
	"google.golang.org/appengine" // Required external App Engine library
	"google.golang.org/appengine/log"
	"google.golang.org/appengine/urlfetch"
)

// Payload from Hangouts Chat
type Payload struct {
	Type                      string     `json:"type"`
	EventTime                 string     `json:"eventTime"`
	Token                     string     `json:"token"`
	Message                   Message    `json:"message"`
	User                      chat.User  `json:"user"`
	Space                     chat.Space `json:"space"`
	ConfigCompleteRedirectURL string     `json:"configCompleteRedirectUrl"`
}

// Contains Message Data
type Message struct {
	Name         string            `json:"name"`
	Sender       chat.User         `json:"sender"`
	CreateTime   string            `json:"createTime"`
	Text         string            `json:"text"`
	Annotations  []chat.Annotation `json:"annotations"`
	Thread       chat.Thread       `json:"thread"`
	Space        chat.Space        `json:"space"`
	ArgumentText string            `json:"argumentText"`
}

// Payload from Taco API
type TacoPayload struct {
	Recipe       string         `json:"recipe"`
	Name         string         `json:"name"`
	Mixin        DetailsPayload `json:"mixin"`
	MixinURL     string         `json:"mixin_url"`
	Seasoning    DetailsPayload `json:"seasoning"`
	SeasoningURL string         `json:"seasoning_url"`

	BaseLayer    DetailsPayload `json:"base_layer"`
	BaseLayerURL string         `json:"base_layer_url"`

	Condiment    DetailsPayload `json:"condiment"`
	CondimentURL string         `json:"condiment_url"`

	Shell    DetailsPayload `json:"shell"`
	ShellURL string         `json:"shell_url"`
}

// Details from each property on TacoPayload
type DetailsPayload struct {
	Name   string `json:"name"`
	URL    string `json:"url"`
	Recipe string `json:"recipe"`
	Slug   string `json:"slug"`
}

// Returns the exact text given to the bot
func indexHandler(w http.ResponseWriter, r *http.Request) {
	// Set Headers
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	ctx := appengine.NewContext(r)
	payload, err := parseBody(r.Body)
	if err != nil {
		log.Infof(ctx, "Error Occurred", err)
		json.NewEncoder(w).Encode(createTextMessage("An Error Has Occurred"))
		return
	}
	text := strings.ToLower(payload.Message.ArgumentText)
	if strings.Contains(text, "random") {
		taco, err := getTaco(ctx)
		if err != nil {
			json.NewEncoder(w).Encode(chat.Message{Text: "An error getting your taco occurred"})
			return
		}
		message := getTacoResponse(taco)

		json.NewEncoder(w).Encode(message)
		return
	}
	json.NewEncoder(w).Encode(chat.Message{Text: "Try keyword random"})
	return

}

func getTacoResponse(taco TacoPayload) chat.Message {
	basePara := chat.TextParagraph{Text: taco.BaseLayer.Name}
	baseWidget := chat.WidgetMarkup{TextParagraph: &basePara}
	condimentPara := chat.TextParagraph{Text: taco.Condiment.Name}
	condimentWidget := chat.WidgetMarkup{TextParagraph: &condimentPara}
	seasoningPara := chat.TextParagraph{Text: taco.Seasoning.Name}
	seasoningWidget := chat.WidgetMarkup{TextParagraph: &seasoningPara}
	mixinPara := chat.TextParagraph{Text: taco.Mixin.Name}
	mixinWidget := chat.WidgetMarkup{TextParagraph: &mixinPara}
	shellPara := chat.TextParagraph{Text: taco.Shell.Name}
	shellWidget := chat.WidgetMarkup{TextParagraph: &shellPara}
	var widgets []*chat.WidgetMarkup
	if taco.ShellURL != "" && taco.BaseLayerURL != "" && taco.CondimentURL != "" && taco.MixinURL != "" && taco.SeasoningURL != "" {
		// Url Component Seems Iffy
		link := chat.OpenLink{Url: getLink(taco)}
		onClick := chat.OnClick{OpenLink: &link}
		button := chat.TextButton{Text: "Go Now!", OnClick: &onClick}
		buttonObject := chat.Button{TextButton: &button}
		buttonArray := []*chat.Button{&buttonObject}
		buttonWidget := chat.WidgetMarkup{Buttons: buttonArray}
		widgets = []*chat.WidgetMarkup{&baseWidget, &seasoningWidget, &condimentWidget, &mixinWidget, &shellWidget, &buttonWidget}
	} else {
		widgets = []*chat.WidgetMarkup{&baseWidget, &seasoningWidget, &condimentWidget, &mixinWidget, &shellWidget}
	}
	section := chat.Section{Widgets: widgets}
	sections := []*chat.Section{&section}
	header := chat.CardHeader{Title: "Nacho's Taco of the Day", Subtitle: taco.Name}
	card := chat.Card{Sections: sections, Header: &header}
	cards := []*chat.Card{&card}
	message := chat.Message{Cards: cards, Text: "```" + taco.Recipe + "```"}
	return message
}

// An attempt and creating a url with the proper slugs
func getLink(taco TacoPayload) string {
	slugs := ""
	if taco.BaseLayerURL != "" {
		slugs = taco.BaseLayer.Slug + "/"
	}
	if taco.MixinURL != "" {
		slugs = slugs + taco.Mixin.Slug + "/"

	}
	if taco.CondimentURL != "" {

		slugs = slugs + taco.Condiment.Slug + "/"

	}
	if taco.SeasoningURL != "" {
		slugs = slugs + taco.Seasoning.Slug + "/"

	}
	if taco.ShellURL != "" {
		slugs = slugs + taco.Shell.Slug + "/"

	}
	return "http://taco-randomizer.herokuapp.com/" + slugs
}

// Handle Http Events
func main() {
	http.HandleFunc("/", indexHandler)
	appengine.Main() // Starts the server to receive requests
}

// Retrieves taco from taco api
func getTaco(ctx context.Context) (TacoPayload, error) {
	var taco TacoPayload
	client := urlfetch.Client(ctx)
	resp, err := client.Get("http://taco-randomizer.herokuapp.com/random/?full-taco=true")
	if err != nil {
		return taco, err

	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	err = json.Unmarshal(body, &taco)
	if err != nil {
		return taco, err
	}
	return taco, nil
}

// Read the Body into a Payload Struct and return it
func parseBody(body io.ReadCloser) (Payload, error) {
	var pload Payload
	payload, err := ioutil.ReadAll(body)
	defer body.Close()
	if err != nil {

		return pload, err
	}
	err = json.Unmarshal(payload, &pload)
	if err != nil {
		return pload, err
	}
	return pload, nil
}

// Helper function to create a simple text message in hangouts chat
func createTextMessage(text string) chat.Message {
	return chat.Message{Text: text}
}
