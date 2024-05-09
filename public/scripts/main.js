var rhit = rhit || {};

rhit.main = function () {
    console.log("Ready");

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log("The user is signed in ", user.uid);
        } else {
            console.log("There is no user signed in!");
        }
    });

    this.setUpAuthEventListeners();
    rhit.startFirebaseUI();
};

document.addEventListener('DOMContentLoaded', function() {
    rhit.setUpEventHandlers();
});

rhit.setUpEventHandlers = function() {
    document.querySelector("#submitNumber").addEventListener("click", rhit.generateBracket);
};

rhit.setUpAuthEventListeners = function() {
    document.querySelector("#signOutButton").addEventListener("click", function() {
        firebase.auth().signOut().then(function() {
            console.log("Signed out successfully!");
            window.location.href = 'index.html'; // Redirect after sign out
        }).catch(function(error) {
            console.error("Sign out failed: ", error);
        });
    });
    // other event listeners...
};

rhit.generateBracket = function() {
    const bracketSize = parseInt(document.querySelector("#numberInput").value);
    if (isNaN(bracketSize) || bracketSize <= 0) {
        alert("Please enter a valid number!");
        return;
    }

    document.getElementById("myModal").style.display = "none";
    const bracketContainer = document.getElementById("bracketContainer");
    bracketContainer.innerHTML = "";

    const bracket = document.createElement("div");
    bracket.className = "bracket";
    for (let i = 0; i < bracketSize; i++) {
        const entrant = document.createElement("div");
        entrant.className = "entrant";
        entrant.textContent = `Entrant ${i + 1}`;
        bracket.appendChild(entrant);
    }
    bracketContainer.appendChild(bracket);
    bracketContainer.style.display = "block";
};

rhit.startFirebaseUI = function() {
    const ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#firebaseui-auth-container', {
        signInSuccessUrl: '/main.html',
        signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
            firebase.auth.PhoneAuthProvider.PROVIDER_ID,
            firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
        ],
    });
};

rhit.main();
