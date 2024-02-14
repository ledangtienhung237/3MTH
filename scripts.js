let searchResults = []; // Array to store search results
let currentSuggestions = []; // Array to store current suggestions
let allData = []; // Variable to store all data

const sheetId = '1z78L-ekU5Lk-F3b4VHhKS3b1lEYmbbG9bUjmG4ss6Zc'; // Replace 'YOUR_SHEET_ID' with your actual sheet ID
const apiKey = 'AIzaSyCC44a5q3PVMDLMNHKkeNU6LmLDM9vxdL8'; // Replace 'YOUR_API_KEY' with your actual API key

const maxSuggestions = 10; // Maximum number of suggestions to display

function fetchData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Trang tính1?key=${apiKey}`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            return response.json();
        })
        .then(data => {
            console.log('Data from Google Sheets:', data);
            // Store all data except header row
            allData = data.values.slice(1);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// Call fetchData function when the page loads
window.onload = function() {
    fetchData();
    // Refresh data periodically (every 5 minutes)
    setInterval(fetchData, 5 * 60 * 1000);
};

function suggestGoods() {
    const codeToSearch = document.getElementById('searchInput').value.trim(); // Trim whitespace from input

    // Show the dropdown regardless of input
    const dropdown = document.getElementById('suggestionsDropdown');

    // Search for suggestions based on the partial code
    const suggestions = allData.filter(row => row[0].includes(codeToSearch)).map(row => row[0]);
    currentSuggestions = suggestions.slice(0, maxSuggestions);
    displaySuggestions(currentSuggestions); // Display the suggestions in dropdown

    // Hide dropdown if there are no suggestions or search input is empty
    if (currentSuggestions.length === 0 || codeToSearch === '') {
        dropdown.style.display = 'none';
    } else {
        dropdown.style.display = 'block';
    }
}

function displaySuggestions(suggestions) {
    const dropdown = document.getElementById('suggestionsDropdown');
    dropdown.innerHTML = ''; // Clear previous suggestions
    if (suggestions.length > 0) {
        dropdown.style.display = 'block';
        suggestions.forEach(suggestion => {
            const option = document.createElement('option');
            option.value = suggestion;
            option.textContent = suggestion; // Set the content of the option
            dropdown.appendChild(option);
        });

        // Adjust the height of the dropdown to fit all suggestions
        dropdown.size = suggestions.length;
    } else {
        dropdown.style.display = 'none';
    }
}

function selectSuggestion() {
    const selectedSuggestion = document.getElementById('suggestionsDropdown').value;
    document.getElementById('searchInput').value = selectedSuggestion;
    search(); // Trigger search based on selected suggestion
}

function search() {
    const codeToSearch = document.getElementById('searchInput').value.trim(); // Trim whitespace from input

    // Search for the code and retrieve the quantity, name, and price
    const result = allData.find(row => row[0].trim() === codeToSearch);
    if (result) {
        const [code, name, quantity, price] = result;
        const resultText = `Mã hàng: ${code}, Tên hàng: ${name}, Số lượng: ${quantity}, Giá: ${price}`;
        searchResults.push(resultText); // Add result to array
    } else {
        // If code not found, check if there are suggestions and use the first suggestion
        if (currentSuggestions.length > 0 && codeToSearch.length < currentSuggestions[0].length) {
            document.getElementById('searchInput').value = currentSuggestions[0];
            search(); // Trigger search based on the updated search input
            return;
        } else {
            searchResults.push(`Mã hàng ${codeToSearch} not found`); // Add result to array
        }
    }
    displayResults(); // Display updated results
}
 
// Function to format currency
function formatCurrency(amount) {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}


function displayResults() {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = ''; // Clear previous results

    if (searchResults.length === 0) {
        resultsContainer.innerHTML = 'No results found.';
        return;
    }

    const table = document.createElement('table');
    table.classList.add('result-table');
    table.style.borderCollapse = 'collapse'; // Add border collapse for table
    
    // Create table header
    const headerRow = document.createElement('tr');
    const headers = ['Mã hàng', 'Tên hàng', 'Số lượng', 'Giá', 'Đặt hàng']; // Updated headers to include price and order button
    headers.forEach(headerText => {
        const headerCell = document.createElement('th');
        headerCell.textContent = headerText;
        headerCell.style.border = '1px solid black'; // Add border to header cell
        headerRow.appendChild(headerCell);
    });
    table.appendChild(headerRow);

    // Create table rows for search results
    searchResults.forEach(result => {
        const [code, name, quantity, price] = parseResult(result);

        const row = document.createElement('tr');
        row.style.border = '1px solid black'; // Add border to table row

        const codeCell = document.createElement('td');
        codeCell.textContent = code;
        codeCell.style.border = '1px solid black'; // Add border to cell
        row.appendChild(codeCell);

        const nameCell = document.createElement('td');
        nameCell.textContent = name;
        nameCell.style.border = '1px solid black'; // Add border to cell
        row.appendChild(nameCell);

        const quantityCell = document.createElement('td');
        quantityCell.textContent = quantity;
        quantityCell.style.border = '1px solid black'; // Add border to cell
        row.appendChild(quantityCell);

        const priceCell = document.createElement('td');
        priceCell.textContent = price;
        priceCell.style.border = '1px solid black'; // Add border to cell
        row.appendChild(priceCell);

        const orderCell = document.createElement('td');
        const orderButton = document.createElement('button');
                orderButton.textContent = 'Order';
                orderButton.classList.add('button-7'); // Add the CSS class 'button-7' to the order button
                orderButton.dataset.code = code; // Set the code as data attribute for the order button
                orderButton.addEventListener('click', addToOrder);
                orderCell.appendChild(orderButton);
                orderCell.style.border = '1px solid black'; // Add border to cell
                row.appendChild(orderCell);

                table.appendChild(row);
    });

    resultsContainer.appendChild(table);
    // Hide the dropdown after search
    document.getElementById('suggestionsDropdown').style.display = 'none';

    // Show the order form if there are search results
    if (searchResults.length > 0) {
        document.getElementById('orderForm').style.display = 'block';
    }
}

// Function to add item to order when the order button is clicked
function addToOrder(event) {
    const code = event.target.dataset.code;
    const orderTable = document.getElementById('orderTable');

    // Find the item details by code
    const result = allData.find(row => row[0].trim() === code);

    if (result) {
        const [_, name, pricePerUnit] = result;
        const numericPricePerUnit = parseFloat(pricePerUnit.replace(/\D/g, '')); // Remove non-numeric characters from price

        // Create a new row for the ordered item
        const row = document.createElement('tr');

        // Create cells for the item details
        const codeCell = document.createElement('td');
        codeCell.textContent = code;
        row.appendChild(codeCell);

        const nameCell = document.createElement('td');
        nameCell.textContent = name;
        row.appendChild(nameCell);

        const quantityCell = document.createElement('td');
        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.min = '0';
        quantityInput.value = '0';
        quantityInput.dataset.code = code;
        quantityInput.addEventListener('input', updatePrice);
        quantityCell.appendChild(quantityInput);
        row.appendChild(quantityCell);

        const priceCell = document.createElement('td');
        priceCell.textContent = formatCurrency(0); // Initial price set to 0
        row.appendChild(priceCell);

        // Append the row to the order table
        orderTable.appendChild(row);
    }
}


// Function to update price based on quantity input
function updatePrice(event) {
    const quantity = parseInt(event.target.value);
    const code = event.target.dataset.code;
    const row = event.target.closest('tr');

    // Find the item details by code
    const result = allData.find(row => row[0].trim() === code);

    if (result) {
        const [, , , price] = result;
        const pricePerUnit = parseFloat(price.replace(/\D/g, '')); // Parse price per unit as numeric value

        const totalPrice = pricePerUnit * quantity;
        const priceCell = row.querySelector('td:nth-child(4)'); // Get the price cell

        // Update the price cell with formatted total price
        priceCell.textContent = formatCurrency(totalPrice);
    }
}


function parseResult(result) {
    console.log("Parsing result:", result);
    const match = result.match(/Mã hàng: (.+), Tên hàng: (.+), Số lượng: (\d+), Giá: (.+)/);
    console.log("Match:", match);
    if (match) {
        return [match[1], match[2], match[3], match[4]];
    }
    return ['', '', '', ''];
}

function clearSearch() {
    searchResults = []; // Clear search results array
    displayResults(); // Clear displayed results
}

// Function to submit the order
function submitOrder(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    // Get order details
    const orderItems = [];
    const inputs = document.querySelectorAll('#orderItems input[type="number"]');
    inputs.forEach(input => {
        const code = input.dataset.code;
        const quantity = parseInt(input.value);
        if (quantity > 0) {
            orderItems.push({ code, quantity });
        }
    });

    // Do something with the order items (e.g., send them to a server)
    console.log('Order submitted:', orderItems);

    // You can add further processing here, such as sending the order to a server
    // and displaying a confirmation message to the user.
}

// Add event listener to input field to handle "Enter" key press
document.getElementById('searchInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        search(); // Call the search function when "Enter" key is pressed
    }
});
