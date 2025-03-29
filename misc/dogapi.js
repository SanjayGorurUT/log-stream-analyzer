
async function getData(url) {
    const response = await fetch(url);
    return response.json();
}

getData("https://dog.ceo/api/breeds/image/random").then((data) => {
    console.log("Dog image: ", data.message);
}).catch((err) => {
    console.error("Error fetching data: ", err);
});