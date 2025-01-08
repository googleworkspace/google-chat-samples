/**
 * Copyright 2025 Google LLC
 *
 * <p>Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of the License at
 *
 * <p>http://www.apache.org/licenses/LICENSE-2.0
 *
 * <p>Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.google.chat.userAuthApp;

import java.util.Date;

/** A set of OAuth access and refresh tokens for a user. */
public class Tokens {
  private final String  accessToken;
  private final String refreshToken;
  private final Date expiryDate;

  /** Initializes an instance with the provided tokens. */
  public Tokens(String accessToken, String refreshToken, Date expiryDate) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiryDate = expiryDate;
  }

  /** Returns the access token. */
  public String getAccessToken() {
    return this.accessToken;
  }

  /** returns the refresh token. */
  public String getRefreshToken() {
    return this.refreshToken;
  }

  /** Returns the expiration date of the access token. */
  public Date getExpiryDate() {
    return expiryDate;
  }

  @Override
  public boolean equals(Object o) {
    if (o == this)
      return true;
    if (!(o instanceof Tokens))
      return false;
    Tokens other = (Tokens) o;
    boolean accessTokenEquals =
        (this.accessToken == null && other.accessToken == null)
        || (this.accessToken != null && this.accessToken.equals(other.accessToken));
    boolean refreshTokenEquals =
        (this.refreshToken == null && other.refreshToken == null)
        || (this.refreshToken != null && this.refreshToken.equals(other.refreshToken));
    boolean expiryDateEquals =
        (this.expiryDate == null && other.expiryDate == null)
        || (this.expiryDate != null && this.expiryDate.equals(other.expiryDate));
    return accessTokenEquals && refreshTokenEquals && expiryDateEquals;
  }

  @Override
  public final int hashCode() {
    int result = 17;
    if (accessToken != null) {
      result = 31 * result + accessToken.hashCode();
    }
    if (refreshToken != null) {
      result = 31 * result + refreshToken.hashCode();
    }
    if (expiryDate != null) {
      result = 31 * result + expiryDate.hashCode();
    }
    return result;
  }
}
