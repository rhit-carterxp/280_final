var rhit = rhit || {};

rhit.fbAuthManager = {
    auth: firebase.auth(),
    db: firebase.firestore(),
    init: function() {
        this.auth.onAuthStateChanged(this.handleAuthStateChanged.bind(this));
    },
    checkOrCreateUser: function(user) {
        if (!user) return;  // Ensure the user is not null

        const userRef = this.db.collection('users').doc(user.uid);
        userRef.get().then((doc) => {
            if (!doc.exists) {
                console.log("No Firestore document for UID:", user.uid, "Creating one...");
                return userRef.set({
                    uid: user.uid,
                    email: user.email || null,
                    tournament: 
                    // lastLogin: firebase.firestore.Timestamp.now()
                }, { merge: true });
            } else {
                console.log("Firestore document already exists for UID:", user.uid);
            }
        }).then(() => {
            console.log("User document checked/created successfully.");
        }).catch((error) => {
            console.error("Error in checkOrCreateUser:", error);
        });
    },
    handleAuthStateChanged: function(user) {
        console.log(user ? "The user is signed in" : "There is no user signed in!");
        if (user) {
            this.checkOrCreateUser(user);
            rhit.tournamentManager.init();
        }
    }
};

rhit.tournamentManager = {
    entrants: [],
    currentEntrantIndex: 0,
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
        document.querySelector("#numberInput").style.display = "none";
        document.querySelector("#submitNumber").style.display = "none";
        document.querySelector("#entrantNameInput").style.display = "block";
        document.querySelector("#submitName").style.display = "block";
        document.querySelector("#entrantNameInput").focus();

        const userRef = rhit.fbAuthManager.db.collection('users').doc(rhit.fbAuthManager.auth.currentUser.uid);
        userRef.collection('users').doc(user.uid).set({
            entrants: [],
            totalEntrants: num
        }, { merge: true });
    },
    handleNameSubmission: function() {
        const name = document.querySelector("#entrantNameInput").value.trim();
        if (!name) {
            alert("Please enter a name!");
            return;
        }
        const userRef = rhit.fbAuthManager.db.collection('users').doc(rhit.fbAuthManager.auth.currentUser.uid);
        userRef.collection('tournaments').doc('currentTournament').update({
            entrants: firebase.firestore.FieldValue.arrayUnion(name)
        });
        this.entrants.push(name);
        document.querySelector("#entrantNameInput").value = ""; // Clear the input for the next name
        this.currentEntrantIndex++;
        if (this.currentEntrantIndex >= this.totalEntrants) {
            document.getElementById("myModal").style.display = "none";
            this.displayBracket();
        }
    },
    displayBracket: function() {
        const bracketContainer = document.getElementById("bracketContainer");
        bracketContainer.innerHTML = "";
        const bracket = document.createElement("div");
        bracket.className = "bracket";
        this.entrants.forEach((entrant) => {
            const entrantDiv = document.createElement("div");
            entrantDiv.className = "entrant";
            entrantDiv.textContent = entrant;
            bracket.appendChild(entrantDiv);
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
                    window.location.href = redirectUrl || 'main.html';
                    return false; // Prevents automatic redirect.
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
