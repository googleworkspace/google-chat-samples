// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	chat "google.golang.org/api/chat/v1"
)

func main() {
	// Setup client to write messages to chat.google.com
	client := getOauthClient(os.Getenv("SERVICE_ACCOUNT_PATH"))
	service, err := chat.New(client)
	if err != nil {
		log.Fatalf("failed to create chat service: %s", err)
	}
	msgService := chat.NewSpacesMessagesService(service)

	log.Fatal(http.ListenAndServe(":8080", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		var event chat.DeprecatedEvent
		if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(err.Error()))
			return
		}

		switch event.Type {
		case "MESSAGE":
			d, err := time.ParseDuration(event.Message.Text)
			if err != nil {
				fmt.Fprintf(w, `{"text":"I only deal in time.Duration: %s"}`, err)
				return
			}
			fmt.Fprintf(w, `{"text":"I will try and message you in %v"}`, d)

			// Best effort. If the instance goes away, so be it.
			time.AfterFunc(d, func() {
				msg := &chat.Message{
					Text: fmt.Sprintf("message after %v", d),
				}
				_, err := msgService.Create(event.Space.Name, msg).Do()
				if err != nil {
					log.Printf("failed to create message: %s", err)
				}
			})
		}
	})))
}

func getOauthClient(serviceAccountKeyPath string) *http.Client {
	ctx := context.Background()
	data, err := ioutil.ReadFile(serviceAccountKeyPath)
	if err != nil {
		log.Fatal(err)
	}
	creds, err := google.CredentialsFromJSON(ctx, data, "https://www.googleapis.com/auth/chat.bot")
	if err != nil {
		log.Fatal(err)
	}

	return oauth2.NewClient(ctx, creds.TokenSource)
}
