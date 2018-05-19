package main

import (
	"encoding/json"
	"io"
	"io/ioutil"
	"net/http"

	"google.golang.org/api/chat/v1"
	"google.golang.org/appengine" // Required external App Engine library
	"google.golang.org/appengine/log"
)

type Payload struct {
	Type                      string     `json:"type"`
	EventTime                 string     `json:"eventTime"`
	Token                     string     `json:"token"`
	Message                   Message    `json:"message"`
	User                      chat.User  `json:"user"`
	Space                     chat.Space `json:"space"`
	ConfigCompleteRedirectURL string     `json:"configCompleteRedirectUrl"`
}
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
	json.NewEncoder(w).Encode(payload.Message.ArgumentText)
	return
}

// Handle Http Events
func main() {
	http.HandleFunc("/", indexHandler)
	appengine.Main() // Starts the server to receive requests
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
