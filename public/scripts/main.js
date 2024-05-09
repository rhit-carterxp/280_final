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
    const bracketContainer = document.querySelector("#bracketContainer");

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

    document.querySelector("#submitNumber").addEventListener("click", function () {
        const numberOfPeople = parseInt(document.getElementById("numberInput").value);
        generateBracket(numberOfPeople);
    });

    function generateBracket(numberOfPeople) {
        // Clear previous bracket if exists
        bracketContainer.innerHTML = "";

        // Check if numberOfPeople is a valid number
        if (!isNaN(numberOfPeople) && numberOfPeople > 0) {
            // Generate the bracket HTML based on numberOfPeople
            const bracketHTML = generateBracketHTML(numberOfPeople);
            // Append the bracket HTML to the container
            bracketContainer.innerHTML = bracketHTML;
        } else {
            // If invalid number, display an error message
            bracketContainer.innerHTML = "<p>Please enter a valid number of people.</p>";
        }
    }

    function generateBracketHTML(numberOfPeople) {
        // Implement your logic to generate the bracket HTML here
        // You can use string concatenation or template literals to build the HTML
        // Example:
        let bracketHTML = "<div class='bracket'>";

        // Your logic here to generate the bracket structure based on the number of people

        bracketHTML += "</div>";
        return bracketHTML;
    }

    rhit.startFirebaseUI();
};

rhit.startFirebaseUI = function () {
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
