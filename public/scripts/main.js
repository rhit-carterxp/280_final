var rhit = rhit || {};

/** Firebase Authentication and Firestore Manager **/
rhit.fbAuthManager = {
    auth: firebase.auth(),
    db: firebase.firestore(),
    init: function() {
        console.log("Initializing Firebase Authentication...");
        this.auth.onAuthStateChanged(this.handleAuthStateChanged.bind(this));
    },
    checkOrCreateUser: function(user) {
        if (!user) {
            console.log("No user is currently signed in.");
            return;
        }
        const userRef = this.db.collection('users').doc(user.uid);
        userRef.get().then((doc) => {
            if (!doc.exists) {
                console.log("Creating Firestore document for UID:", user.uid);
                userRef.set({
                    uid: user.uid,
                    email: user.email || null,
                    lastLogin: firebase.firestore.Timestamp.now()
                }, { merge: true }).then(() => {
                    console.log("New user document created.");
                }).catch((error) => {
                    console.error("Error creating new user document:", error);
                });
            } else {
                console.log("Existing Firestore document found for UID:", user.uid);
            }
        }).catch((error) => {
            console.error("Error accessing Firestore:", error);
        });
    },
    handleAuthStateChanged: function(user) {
        console.log(user ? "User is signed in." : "No user is signed in.");
        if (user) {
            this.checkOrCreateUser(user);
            rhit.tournamentManager.init();
        }
    }
};

/** Tournament Management Logic **/
rhit.tournamentManager = {
    entrants: [],
    currentEntrantIndex: 0,
    totalEntrants: 0,
    matches: [],
    init: function() {
        console.log("Initializing Tournament Management...");
        document.getElementById('signOutButton').addEventListener('click', this.signOut.bind(this));
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
        const num = parseInt(document.querySelector("#numberInput").value, 10);
        if (isNaN(num) || num <= 0) {
            alert("Please enter a valid number!");
            return;
        }
        this.totalEntrants = num;
        document.querySelector("#numberInput").style.display = "none";
        document.querySelector("#submitNumber").style.display = "none";
        document.querySelector("#entrantNameInput").style.display = "block";
        document.querySelector("#submitName").style.display = "block";
        console.log("Number of entrants submitted: " + num);
    },
    handleNameSubmission: function() {
        const name = document.querySelector("#entrantNameInput").value.trim();
        if (!name) {
            alert("Please enter a name!");
            return;
        }
        const userRef = rhit.fbAuthManager.db.collection('users').doc(rhit.fbAuthManager.auth.currentUser.uid);
        userRef.update({
            entrants: firebase.firestore.FieldValue.arrayUnion(name)
        }).then(() => {
            console.log("Entrant added successfully:", name);
            this.entrants.push(name);
            document.querySelector("#entrantNameInput").value = ""; // Clear the input for the next name
            this.currentEntrantIndex++;
            if (this.currentEntrantIndex >= this.totalEntrants) {
                document.getElementById("myModal").style.display = "none";
                this.displayBracket();
            }
        }).catch((error) => {
            console.error("Error updating entrants:", error);
        });
    },
    displayBracket: function() {
        console.log("Displaying the tournament bracket...");
        const bracketContainer = document.getElementById("bracketContainer");
        if (!bracketContainer) {
            console.error("Bracket container not found.");
            return;
        }
        bracketContainer.innerHTML = ""; // Clear previous content
        const bracket = document.createElement("div");
        bracket.className = "bracket";
        bracket.style.display = "flex";

        let numRounds = Math.ceil(Math.log2(this.totalEntrants));
        if (this.matches.length === 0) {
            this.matches = Array.from({ length: numRounds }, () => []);
            for (let i = 0; i < this.entrants.length; i += 2) {
                this.matches[0].push([this.entrants[i], this.entrants[i + 1] || "TBD"]);
            }
        }

        for (let round = 1; round < numRounds; round++) {
            if (this.matches[round].length === 0) {
                for (let match = 0; match < Math.pow(2, numRounds-round-1); match++) {
                    this.matches[round].push(["TBD", "TBD"]);
                }
            }
        }

        this.matches.forEach((roundMatches, roundIndex) => {
            const roundDiv = document.createElement("div");
            roundDiv.className = "round";
            roundMatches.forEach((match, matchIndex) => {
                const matchDiv = document.createElement("div");
                matchDiv.className = "match";
                match.forEach((entrant, entrantIndex) => {
                    const entrantButton = document.createElement("button");
                    entrantButton.className = "entrant";
                    entrantButton.textContent = entrant;
                    matchDiv.appendChild(entrantButton);

                    if (entrant !== "TBD") {
                        entrantButton.onclick = () => {
                            let nextRound = roundIndex + 1;
                            if (nextRound < this.matches.length) {
                                let nextMatchIndex = Math.floor(matchIndex / 2);
                                let position = matchIndex % 2 === 0 ? 0 : 1;
                                this.matches[nextRound][nextMatchIndex][position] = entrant;
                                this.displayBracket(); // Redraw bracket with updated state
                            }
                        };
                    }
                });
                roundDiv.appendChild(matchDiv);
            });
            bracket.appendChild(roundDiv);
        });

        bracketContainer.appendChild(bracket);
        bracketContainer.style.display = "block";
    }
};

/** FirebaseUI Configuration and Initialization **/
rhit.initializeFirebaseUI = function() {
    console.log("Initializing FirebaseUI...");
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
                    console.log("Sign-in successful, redirecting...");
                    window.location.href = redirectUrl || 'main.html';
                    return false; // Prevents automatic redirect.
                }
            }
        });
    }
};

// Entry point of the application
document.addEventListener("DOMContentLoaded", function() {
    console.log("Document loaded, initializing managers...");
    rhit.fbAuthManager.init();
    rhit.initializeFirebaseUI();
});
