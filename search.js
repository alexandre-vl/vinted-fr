import fetch from "node-fetch";
import UserAgent from "user-agents";
import cookie from "cookie";

const cookies = new Map();

//fetches a Vinted cookie to authenticate the requests
const fetchCookie = (domain = "be") => {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    fetch(`https://vinted.${domain}`, {
      signal: controller.signal,
      headers: {
        "user-agent": new UserAgent().toString(),
      },
    })
      .then((res) => {
        const sessionCookie = res.headers.get("set-cookie");
        controller.abort();
        const c = cookie.parse(sessionCookie)["secure, _vinted_fr_session"];
        if (c) {
          //console.log(c);
          cookies.set(domain, c);
        }
        resolve(c);
      })
      .catch((err) => {
        controller.abort();
        reject(err);
      });
  });
};

//gets a bunch of parameters right into the url, not really used but just handy in case :)
const parseVintedURL = (
  search_text,
  order = "newest_first",
  domain = "be",
  catalog_ids = "",
  color_ids = "",
  brand_ids = "",
  size_ids = "",
  material_ids = "",
  video_game_rating_ids = "",
  status_ids = "",
  is_for_swap = 0,
  page = 1,
  per_page = 5
) => {
  return `https://www.vinted.${domain}/api/v2/catalog/items?search_text=${search_text}&order=${order}&catalog_ids=${catalog_ids}&color_ids=${color_ids}&brand_ids=${brand_ids}&size_ids=${size_ids}&material_ids=${material_ids}&video_game_rating_ids=${video_game_rating_ids}&status_ids=${status_ids}&is_for_swap=${is_for_swap}&page=${page}&per_page=${per_page}`;
};

//searches something on vinted, using the 'newest first' order by default

/**
 * Search an item on vinted
 *
 * @param {string} search_text - The text to search
 * @param {string} order - The order of the results (optional, default is newest_first)
 * @returns {Promise} A promise that resolves to the results
 */
const vintedSearch = (search_text, url = "none", order = "newest_first") => {
  return new Promise(async (resolve, reject) => {
    var c = cookies.get("be") || (await fetchCookie("be"));
    const controller = new AbortController();
    fetch(url == "none" ? parseVintedURL(search_text, order) : url, {
      headers: {
        "user-agent": new UserAgent(),
        cookie: "_vinted_fr_session=" + c,
        accept: "application/json, text/plain, */*",
      },
    })
      .then((res) => {
        controller.abort();
        res.json().then((data) => {
          resolve(data);
        });
      })
      .catch((err) => {
        controller.abort();
        reject(err);
      });
  });
};

export default vintedSearch;
