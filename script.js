document.querySelector(".continue").addEventListener("click", function () {
  document.querySelector(".typing-container").style.display = "block";
  document.querySelector(".chat-container").style.display = "block";
  document.querySelector(".info_box").style.display = "none";
});

const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");


let userText = null;
// API Configuration
const GEMINI_API_KEY = "AIzaSyB58na4JKHZKpSAR1wzNn330JE-JQ2U85E";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
const initialHeight = chatInput.scrollHeight;

const loadDatafromLocalstorage = () => {
  const themeColor = localStorage.getItem("theme-color");

  document.body.classList.toggle("light_mode", themeColor === "light_mode");
  themeButton.innerText = document.body.classList.contains("light_mode") ? "dark_mode" : "light_mode";

  const defaultText = `<div class="default-text">
                        <h1>ChatGPT Clone</h1>
                        <p> Start a conversation and explore the power of AI. <br> Your chat history will be displayed here.</p>
                      </div>`

  chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
  // chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

loadDatafromLocalstorage();

const createElement = (html, className) => {
  // Create new div and apply chat, specified class and set the html content of div
  const chatDiv = document.createElement("div");
  chatDiv.classList.add("chat", className);
  chatDiv.innerHTML = html;
  return chatDiv; //Return the created chat div
}

const getChatResponse = async (incomingChatDiv) => {

  const textElement = document.createElement("p"); //Get the text element

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: userText }]
        }]
      })
    });

    const data = await response.json();

    const apiResponse = data?.candidates[0].content.parts[0].text.trim();
    //console.log(apiResponse)
    textElement.textContent = apiResponse;
  } catch (error) {
    textElement.classList.add("error");
    textElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
  }

  // remove the typing animation, append the paragraph element and save the chats to local storage  
  incomingChatDiv.querySelector(".typing-animation").remove();
  incomingChatDiv.querySelector(".chat-details").appendChild(textElement);
  // chatContainer.scrollTo(0, chatContainer.scrollHeight);
  localStorage.setItem("all-chats", chatContainer.innerHTML)
}
const copyResponse = (copyBtn) => {
  // Copy the text content of the response to the clipboard
  const responseTextElement = copyBtn.parentElement.querySelector("p");
  navigator.clipboard.writeText(responseTextElement.textContent);
  copyBtn.textContent = "done";
  setTimeout(() => copyBtn.textContent = "content_copy", 1000);
}

const showTypingAnimation = () => {
  const html = `<div class="chat-content">
      <div class="chat-details">
        <img src="images/chatgpt.jpg" alt="" />
        <div class="typing-animation">
          <div class="typing-dot" style="--delay: 0.2s"></div>
          <div class="typing-dot" style="--delay: 0.3s"></div>
          <div class="typing-dot" style="--delay: 0.4s"></div>
        </div>
        <p class="text"></p>
      </div>
      <span onclick="copyResponse(this)" class="material-icons">content_copy</span>
    </div>`;
  // create an incoming chat div with user's message and append it to the chat container
  const incomingChatDiv = createElement(html, "incoming");
  chatContainer.appendChild(incomingChatDiv);
  //chatContainer.scrollTo(0, chatContainer.scrollHeight);
  getChatResponse(incomingChatDiv);
}

const handleOutgoingChat = () => {
  userText = chatInput.value.trim(); // Fetches chatinput value and trim extra spaces
  if (!userText) return; //if chatInput is empty return from here
  chatInput.value = "";
  chatInput.style.height = `${initialHeight}px`;

  const html = `<div class="chat outgoing">
    <div class="chat-content">
      <div class="chat-details">
        <img src="images/sherif.jpeg" alt="" />
        <p></p>
      </div>
      </div>
    </div>`;

  // create an outgoing chat div with user's message and append it to the chat container
  const outgoingChatDiv = createElement(html, "outgoing");
  outgoingChatDiv.querySelector("p").textContent = userText;
  document.querySelector(".default-text")?.remove();
  chatContainer.appendChild(outgoingChatDiv);
  // chatContainer.scrollTo(0, chatContainer.scrollHeight);
  setTimeout(showTypingAnimation, 500);
  //console.log(userText);
}
deleteButton.addEventListener("click", () => {
  // Remove the chats from local storage and call the loadDatafromLocalstorage function
  if (confirm("Are you sure you want to delete all the chats?")) {
    localStorage.removeItem("all-chats");
    loadDatafromLocalstorage();
  }
})

themeButton.addEventListener("click", () => {
  // Toggle the body's class for the theme mode and save the updated theme to the local storage
  document.body.classList.toggle("light_mode");
  localStorage.setItem("theme-color", themeButton.innerText);
  themeButton.innerText = document.body.classList.contains("light_mode") ? "dark_mode" : "light_mode";
});



chatInput.addEventListener("input", () => {
  // Adjust the height of the input field dynamically based on its content
  chatInput.style.height = `${initialHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  // If the Enter key is pressed without Shift and the window width is larger than 800 pixels, handle the outgoing chat
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleOutgoingChat();
  }
});

sendButton.addEventListener("click", handleOutgoingChat);