var rhit = rhit || {};

rhit.main = function () {
    console.log("Ready");
    this.initializeFirebaseUI();
    this.setupEventListeners();
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log("The user is signed in", user.uid);
            this.initializeTournamentSetup();
        } else {
            console.log("There is no user signed in!");
            // Optionally handle UI changes when no user is signed in
        }
    });
};

rhit.setupEventListeners = function() {
    document.getElementById('signOutButton').addEventListener('click', function() {
        firebase.auth().signOut().then(function() {
            console.log('Sign-out successful.');
            // Redirect to index.html after signing out
            window.location.href = 'index.html';
        }).catch(function(error) {
            console.error('Sign-out error:', error);
        });
    });
};

rhit.initializeTournamentSetup = function() {
    document.querySelector("#submitNumber").addEventListener("click", function() {
        rhit.handleNumberSubmission();
    });
    document.querySelector("#submitName").addEventListener("click", rhit.handleNameSubmission);
    rhit.entrants = [];
    rhit.currentEntrantIndex = 0;
};

rhit.handleNumberSubmission = function() {
    const num = parseInt(document.querySelector("#numberInput").value);
    if (isNaN(num) || num <= 0) {
        alert("Please enter a valid number!");
        return;
    }
    rhit.totalEntrants = num;
    document.querySelector("#numberInput").style.display = "none";
    document.querySelector("#submitNumber").style.display = "none";
    document.querySelector("#entrantNameInput").style.display = "block";
    document.querySelector("#submitName").style.display = "block";
    document.querySelector("#entrantNameInput").focus();
};

rhit.handleNameSubmission = function() {
    const name = document.querySelector("#entrantNameInput").value.trim();
    if (!name) {
        alert("Please enter a name!");
        return;
    }
    rhit.entrants.push(name);
    document.querySelector("#entrantNameInput").value = ""; // Clear the input for the next name
    rhit.currentEntrantIndex++;
    if (rhit.currentEntrantIndex >= rhit.totalEntrants) {
        document.getElementById("myModal").style.display = "none";
        rhit.displayBracket();
    }
};

rhit.displayBracket = function() {
    const bracketContainer = document.getElementById("bracketContainer");
    bracketContainer.innerHTML = "";
    const bracket = document.createElement("div");
    bracket.className = "bracket";
    rhit.entrants.forEach((entrant) => {
        const entrantDiv = document.createElement("div");
        entrantDiv.className = "entrant";
        entrantDiv.textContent = entrant;
        bracket.appendChild(entrantDiv);
    });
    bracketContainer.appendChild(bracket);
    bracketContainer.style.display = "block";
};

rhit.initializeFirebaseUI = function() {
    if (document.getElementById('firebaseui-auth-container')) {
        const ui = new firebaseui.auth.AuthUI(firebase.auth());
        ui.start('#firebaseui-auth-container', {
            signInSuccessUrl: 'main.html',
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID,
                firebase.auth.PhoneAuthProvider.PROVIDER_ID,
                firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
            ],
        });
    }
};

rhit.main();
