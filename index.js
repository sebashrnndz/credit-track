// Script for the landing page
document.addEventListener("DOMContentLoaded", () => {
  // Get the button to enter the app
  const enterAppButton = document.getElementById("enter-app")

  // Add click event listener
  enterAppButton.addEventListener("click", (e) => {
    // You can store any data that needs to be passed to the app here
    // For example, user preferences or initial data

    // Store data in localStorage that might be needed in the app
    const currentDate = new Date()
    localStorage.setItem("lastVisit", currentDate.toISOString())

    // No need to prevent default since we're using a regular link
    // The href attribute will navigate to app.html
  })
})

