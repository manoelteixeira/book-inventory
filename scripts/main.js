/*************************/
/*    Global Variables   */
/*************************/
const bookList = document.querySelector(".book-list");
const addBookForm = document.getElementById("add-book-form");
const message = document.querySelector(".add-book__response");
const appData = [];

/**************************/
/*    Helper Functions    */
/**************************/

function validateImageUrl(url) {
  const urlRegex = /^https?:\/\/.+\.(jpeg|jpg|webp|png)$/g;
  return urlRegex.test(url);
}

function generateBookObject(bookFormData) {
  let { title, author, imgUrl, status, price } = bookFormData;
  // Validate Data
  const invalidFields = [];
  if (title.value == "") {
    invalidFields.push("Title");
  } else {
    title = title.value;
  }

  if (author.value == "") {
    invalidFields.push("Author");
  } else {
    author = author.value;
  }

  if (imgUrl.value == "") {
    imgUrl = "./images/image-not-found.png";
  } else if (!validateImageUrl(imgUrl.value)) {
    invalidFields.push("Image URL");
  } else {
    imgUrl = imgUrl.value;
  }

  if (status.value == "") {
    invalidFields.push(status);
  } else {
    status = status.value;
  }
  price.value = price.value.replace(",", ".");
  console.log(price.value);
  if (price.value == "" || isNaN(Number(price.value))) {
    invalidFields.push("Price");
  } else {
    price = Number(price.value);
  }
  console.log(invalidFields);
  if (invalidFields.length > 0) {
    return { error: invalidFields };
  }

  return {
    title,
    author,
    imgUrl,
    status,
    price,
  };
}

function generateBookDiv(bookObj) {
  const { title, author, imgUrl, price, status } = bookObj;
  // Setup Image
  const bookCover = document.createElement("img");
  bookCover.classList.add("book__cover");
  bookCover.src = imgUrl;

  // Setup Book Details
  const detailsTitle = document.createElement("span");
  detailsTitle.classList.add("book__details-title");
  detailsTitle.innerText = title;

  const detailsAuthor = document.createElement("span");
  detailsAuthor.classList.add("book__details-author");
  detailsAuthor.innerText = author;

  const detailsStatus = document.createElement("span");
  detailsStatus.classList.add("book__details-status", status);
  detailsStatus.innerHTML = status == "in-stock" ? "In Stock" : "Out of Stock";

  const detailsPrice = document.createElement("span");
  detailsPrice.classList.add("book__details-price");
  detailsPrice.innerText = `\$${price}`;

  const bookDetails = document.createElement("div");
  bookDetails.classList.add("book__details");
  bookDetails.appendChild(detailsTitle);
  bookDetails.appendChild(detailsAuthor);
  bookDetails.appendChild(detailsStatus);
  bookDetails.appendChild(detailsPrice);

  // Setup Delete button
  const bookDelete = document.createElement("img");
  bookDelete.classList.add("book__delete");
  bookDelete.src = "./images/trash.svg";
  bookDelete.addEventListener("click", (event) => {
    bookDelete.parentElement.remove();
    deleteBook(event.target.parentElement);
    fadeMessage("Book Deleted successfully.", "red");
  });

  // Setup New Book
  const newBook = document.createElement("div");
  newBook.classList.add("book");
  newBook.appendChild(bookCover);
  newBook.appendChild(bookDetails);
  newBook.appendChild(bookDelete);

  return newBook;
}

function fadeMessage(str, color) {
  message.innerText = str;
  message.style.color = color;
  message.style.display = "";
  message.classList.add("fade");
  setTimeout(() => {
    message.classList.remove("fade");
    message.innerText = "";
  }, 5000);
}

function clearAddBookForm() {
  addBookForm.title.value = "";
  addBookForm.author.value = "";
  addBookForm.imgUrl.value = "";
  addBookForm.price.value = "";
  addBookForm.status.value = "in-stock";
}

function saveAppData() {
  const data = appData.filter((book) => book != undefined);
  const dataString = JSON.stringify(data);
  localStorage.setItem("app-data", dataString);
}

function loadAppData() {
  const localData = localStorage.getItem("app-data");
  if (localData) {
    const data = JSON.parse(localData);
    appData.push(...data);
    for (const book of appData) {
      bookList.appendChild(generateBookDiv(book));
    }
  }
}

function getBookIndex(title, author) {
  for (let idx = 0; idx < appData.length; idx++) {
    const book = appData[idx];
    if (book.title == title || book.author == author) {
      return idx;
    }
  }
  return -1;
}

function deleteBook(bookDiv) {
  const title = bookDiv.querySelector(".book__details-title").innerText;
  const author = bookDiv.querySelector(".book__details-author").innerText;
  const bookIndex = getBookIndex(title, author);
  delete appData[bookIndex];
  saveAppData();
}

/**************/
/*    Main    */
/**************/
addBookForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const newBook = generateBookObject(event.target);
  if (newBook.error) {
    const error = newBook.error.join(", ");
    fadeMessage(`Invalid Fields: ${error}`, "red");
  } else {
    const newBookDiv = generateBookDiv(newBook);
    bookList.append(newBookDiv);
    appData.push(newBook);
    saveAppData();
    fadeMessage("Book added successfully.", "green");
    clearAddBookForm();
  }
});

loadAppData();
