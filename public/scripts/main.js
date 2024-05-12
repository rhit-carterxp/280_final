var rhit = rhit || {};

rhit.fbAuthManager = {
    auth: firebase.auth(),
    db: firebase.firestore(),
    init: function() {
        this.auth.onAuthStateChanged(this.handleAuthStateChanged.bind(this));
    },
    checkOrCreateUser: function(user) {
        if (!user) return;

        const userRef = this.db.collection('users').doc(user.uid);
        userRef.get().then((doc) => {
            if (!doc.exists) {
                console.log("Creating Firestore document for UID:", user.uid);
                userRef.set({
                    uid: user.uid,
                    email: user.email || null,
                    lastLogin: firebase.firestore.Timestamp.now(),
                }, { merge: true });
            } else {
                console.log("Firestore document exists for UID:", user.uid);
            }
        }).catch((error) => {
            console.error("Error in checkOrCreateUser:", error);
        });
    },
    handleAuthStateChanged: function(user) {
        console.log(user ? "User signed in" : "No user signed in");
        if (user) {
            this.checkOrCreateUser(user);
            rhit.tournamentManager.init();
        }
    }
};

rhit.tournamentManager = {
    entrants: [],
    currentEntrantIndex: 0,
    totalEntrants: 0,
    init: function() {
        document.getElementById('signOutButton').addEventListener('click', this.signOut);
        document.querySelector("#submitNumber").addEventListener("click", this.handleNumberSubmission.bind(this));
        document.querySelector("#submitName").addEventListener("click", this.handleNameSubmission.bind(this));
    },
    signOut: function() {
        rhit.fbAuthManager.auth.signOut().then(() => {
            console.log('Sign-out successful.');
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error('Sign-out error:', error);
        });
    },
    handleNumberSubmission: function() {
        const num = parseInt(document.querySelector("#numberInput").value);
        if (isNaN(num) || num <= 0) {
            alert("Please enter a valid number!");
            return;
        }
        this.totalEntrants = num;
        this.entrants = []; // Clear previous entrants if any
        this.currentEntrantIndex = 0; // Reset index
        document.querySelector("#numberInput").style.display = "none";
        document.querySelector("#submitNumber").style.display = "none";
        document.querySelector("#entrantNameInput").style.display = "block";
        document.querySelector("#submitName").style.display = "block";
        document.querySelector("#entrantNameInput").focus();
    },
    handleNameSubmission: function() {
        const name = document.querySelector("#entrantNameInput").value.trim();
        if (!name) {
            alert("Please enter a name!");
            return;
        }
        this.entrants.push(name);
        document.querySelector("#entrantNameInput").value = ""; // Clear the input for the next name
        this.currentEntrantIndex++;
        if (this.currentEntrantIndex >= this.totalEntrants) {
            document.querySelector("#entrantNameInput").style.display = "none";
            document.querySelector("#submitName").style.display = "none";
            this.displayBracket();
        }
    },
    displayBracket: function() {
        const bracketContainer = document.getElementById("bracketContainer");
        bracketContainer.innerHTML = ""; // Clear previous content
        const bracket = document.createElement("div");
        bracket.className = "bracket";
        bracket.style.display = "flex";

        let numRounds = Math.ceil(Math.log2(this.totalEntrants));
        let matches = Array.from({ length: numRounds }, () => []);

        for (let i = 0; i < this.entrants.length; i += 2) {
            matches[0].push([this.entrants[i], this.entrants[i + 1] || "TBD"]);
        }

        matches.forEach((roundMatches, roundIndex) => {
            const roundDiv = document.createElement("div");
            roundDiv.className = "round";
            roundMatches.forEach((match, matchIndex) => {
                const matchDiv = document.createElement("div");
                matchDiv.className = "match";
                match.forEach(entrant => {
                    const entrantButton = document.createElement("button");
                    entrantButton.className = "entrant";
                    entrantButton.textContent = entrant;
                    entrantButton.onclick = () => {
                        if (entrant !== "TBD" && roundIndex + 1 < numRounds) {
                            let nextRoundMatches = matches[roundIndex + 1];
                            let nextMatchIndex = Math.floor(matchIndex / 2);
                            let position = matchIndex % 2 === 0 ? 0 : 1;
                            nextRoundMatches[nextMatchIndex][position] = entrant;
                            this.displayBracket(); // Redraw bracket with updated state
                        }
                    };
                    matchDiv.appendChild(entrantButton);
                });
                roundDiv.appendChild(matchDiv);
            });
            bracket.appendChild(roundDiv);
        });

        bracketContainer.appendChild(bracket);
        bracketContainer.style.display = "block";
    }
};

rhit.initializeFirebaseUI = function() {
    if (document.getElementById('firebaseui-auth-container')) {
        const ui = new firebaseui.auth.AuthUI(rhit.fbAuthManager.auth);
        ui.start('#firebaseui-auth-container', {
            signInSuccessUrl: 'main.html',
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID,
                firebase.auth.PhoneAuthProvider.PROVIDER_ID,
                firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
            ],
            callbacks: {
                signInSuccessWithAuthResult: function(authResult, redirectUrl) {
                    return false; // Prevent automatic redirect after sign-in
                }
            }
        });
    }
};

// Entry point of the application
document.addEventListener("DOMContentLoaded", function() {
    rhit.fbAuthManager.init();
    rhit.initializeFirebaseUI();
});
