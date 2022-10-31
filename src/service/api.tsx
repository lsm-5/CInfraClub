import axios from "axios";

const api = axios.create({
    baseURL: "https://studiosolsolr-a.akamaihd.net/cc/h2"
});

const scrapCifra = axios.create({
    baseURL: "http://localhost:4000/getdata"
});
export {
    api,
    scrapCifra
}