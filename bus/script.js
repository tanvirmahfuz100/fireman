let schedule = {}; 

// Load schedule data
fetch('bus_schedule.json')
  .then(response => response.json())
  .then(data => schedule = data)
  .catch(error => console.error('Error loading schedule:', error));
