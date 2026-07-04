function handler(event) {
  var request = event.request || {};
  var response = event.response || {};
  var headers = request.headers || {};
  var requestCookies = request.cookies || {};
  var existingLocaleCookie = requestCookies["cybernews-locale"];
  var existingLocale = existingLocaleCookie && existingLocaleCookie.value ? existingLocaleCookie.value : "";
  var countryHeader = headers["cloudfront-viewer-country"];
  var country = countryHeader && countryHeader.value ? countryHeader.value.toUpperCase() : "";
  var locale = existingLocale;

  if (locale !== "zh-Hant" && locale !== "zh-Hans" && locale !== "en") {
    locale = "en";

    if (country === "CN") {
      locale = "zh-Hans";
    } else if (country === "TW") {
      locale = "zh-Hant";
    } else if (!country) {
      locale = "";
    }
  }

  response.cookies = response.cookies || {};

  if (country) {
    response.cookies["cybernews-country"] = {
      value: country,
      attributes: "Secure; Path=/; Max-Age=86400; SameSite=Lax"
    };
  }

  if (locale) {
    response.cookies["cybernews-locale"] = {
      value: locale,
      attributes: "Secure; Path=/; Max-Age=86400; SameSite=Lax"
    };
  }

  return response;
}
