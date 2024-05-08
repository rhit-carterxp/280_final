var rhit = rhit || {};

rhit.main = function () {
    console.log("Ready");

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            const displayName = user.displayName;
            const email = user.email;
            const photoURL = user.photoURL;
            const phoneNumber = user.phoneNumber;
            const isAnonymous = user.isAnonymous;
            const uid = user.uid;

            console.log("The user is signed in ", uid);
            console.log('displayName :>> ', displayName);
            console.log('email :>> ', email);
            console.log('photoURL :>> ', photoURL);
            console.log('phoneNumber :>> ', phoneNumber);
            console.log('isAnonymous :>> ', isAnonymous);
            console.log('uid :>> ', uid);
        } else {
            console.log("There is no user signed in!");
        }
    });

    const inputEmailEl = document.querySelector("#inputEmail");
    const inputPasswordEl = document.querySelector("#inputPassword");

    document.querySelector("#signOutButton").onclick = (event) => {
        console.log(`Sign out`);
        firebase.auth().signOut().then(function () {
            console.log("You are now signed out");
            window.location.href = 'index.html'
        }).catch(function (error) {
            console.log("Sign out error");
        });
    };

    document.querySelector("#createAccountButton").onclick = (event) => {
        console.log(`Create account for email: ${inputEmailEl.value} password:  ${inputPasswordEl.value}`);
        firebase.auth().createUserWithEmailAndPassword(inputEmailEl.value, inputPasswordEl.value).catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log("Create account error", errorCode, errorMessage);
        });
    };
    document.querySelector("#logInButton").onclick = (event) => {
        console.log(`Log in for email: ${inputEmailEl.value} password:  ${inputPasswordEl.value}`);
        firebase.auth().signInWithEmailAndPassword(inputEmailEl.value, inputPasswordEl.value).catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log("Existing account log in error", errorCode, errorMessage);
        });
    };

    document.querySelector("#anonymousAuthButton").onclick = (event) => {
        firebase.auth().signInAnonymously().catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log("Anonymous auth error", errorCode, errorMessage);
        });
    };
    rhit.startFirebaseUI();

    // JavaScript for handling the modal dialog
    const modal = document.getElementById("myModal");
    const btn = document.getElementById("openModal");
    const span = document.getElementsByClassName("close")[0];

    // When the user clicks the button, open the modal
    btn.onclick = function() {
        modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Handle submit button click
    document.getElementById("submitNumber").addEventListener("click", function() {
        const numberInput = document.getElementById("numberInput").value;
        // Do something with the entered number, e.g., send it to server
        console.log("Entered number:", numberInput);
        // Close the modal
        modal.style.display = "none";
    });
};

rhit.startFirebaseUI = function() {
    var uiConfig = {
        signInSuccessUrl: '/main.html',
        signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
            firebase.auth.PhoneAuthProvider.PROVIDER_ID,
            firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
        ],
    };
    const ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#firebaseui-auth-container', uiConfig);
}

rhit.main();
