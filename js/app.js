$(document).ready(function() {

    // TESTING DISCOGS API
    console.log("Test");
    $.ajax({
        method: 'GET',
        url: "https://api.discogs.com/database/search?type=releases?format=cd&q=Nirvana&key=VCWtkFuiXrupBNMAwwnF&secret=DycrSZjEYITFXBeTFFWkoddUcnPqJqCh"
    }).done(function(data) {
        console.log(data);
    });

    // function to get data from Last.fm & Deezer
    function getData(t) {

        // Last.fm query URL
        var lastFmUrl = "https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + t + " &api_key=d4a380aaf885c9d212b299849e585e3f&format=json";

        // AJAX Search Settings for Last.fm (copied from Rapid API)
        var lastFmSearch = {
            "async": true,
        	"crossDomain": true,
	        "url": lastFmUrl,
	        "method": "POST",
	        // "headers": {
		    //     "x-rapidapi-host": "LastFmdimashirokovV1.p.rapidapi.com",
		    //     "x-rapidapi-key": "b8d9d38605msh9b55791ebf9d07dp107fa4jsn8108686f06e9",
		    //     "content-type": "application/x-www-form-urlencoded"
	        // },
	        "data": {
                "artist": t,
		        // "apiKey": "d4a380aaf885c9d212b299849e585e3f"
	        }
        }

        // AJAX (for when Last.fm response is received)
        $.ajax(lastFmSearch).done(function(data) {
            // Run function showLastFMBio, with parameter of data key artist from response
            showLastFMBio(data.artist);
        });

        // declare variable for Artist ID from Deezer (number)
        var deezerArtistID = 0;

        // AJAX Search settings for Deezer general search (copied from Rapid API)
        var deezerSearch = {
            "async": true,
            "crossDomain": true,
            "url": "https://deezerdevs-deezer.p.rapidapi.com/search?q=" + t,
            // "url": "https://api.deezer.com/search?q=" + t,
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "deezerdevs-deezer.p.rapidapi.com",
                "x-rapidapi-key": "b8d9d38605msh9b55791ebf9d07dp107fa4jsn8108686f06e9"
            }
        }
        
        // AJAX (for when Deezer response is received)
        $.ajax(deezerSearch).done(function (response) {
            // assign Deezer Artist ID from Deezer Search response
            deezerArtistID = response.data[0].artist.id;
        });

        // Delay Deezer Artist search half a second (allowing time to receive artist ID before another search)
        setTimeout(function() {

            // AJAX Search Settings for Deezer Artist search (copied from Rapid API)
            var deezerArtistSearch = {
                "async": true,
                "crossDomain": true,
                "url": "https://deezerdevs-deezer.p.rapidapi.com/artist/" + deezerArtistID,
                "method": "GET",
                "headers": {
                    "x-rapidapi-host": "deezerdevs-deezer.p.rapidapi.com",
                    "x-rapidapi-key": "b8d9d38605msh9b55791ebf9d07dp107fa4jsn8108686f06e9"
                }
            }
        
            // AJAX (for when Deezer response for artist search is received)
            $.ajax(deezerArtistSearch).done(function(response) {
                // Run function showDeezerInfo, with parameter of data response
                showDeezerInfo(response);
            });

        },500);
    }

    // function for showing info retrieved from Last.fm
    // Data from Last.fm: summarized bio, similar artists, genres
    function showLastFMBio(d) {
        // declare & assign variable to bio result, search for link "Read more on Last.fm", and remove it
        var bio = d.bio.summary;
        var link = bio.search("<a href");
        bio = bio.slice(0,link);

        // Create two new div's for Bootstrap Card component, one for bio info, and one for more music-related info
        var bioCard = $("<div>").addClass("card").attr('id','bio-card');
        var musicCard = $("<div>").addClass("card");

        // declare & assign array variable to similar artists array from Last.fm response, sort info and arrange in new div of Bootstrap Card Body class
        // Give similar Artists div a Header
        var similar = d.similar.artist;
        var similarArtists = $("<div>").addClass("card-body");
        similarArtists.append($("<h2>").addClass("card-title").text("Similar Artists"));

        // sort through array elements, put in new unordered list, put list if div similarArtists
        var similarArtistsList = $("<ul>");
        for(var i=0; i<similar.length; i++) {
            var newArtist = $("<li>").html("<a href='#' class='artist-link'>"+similar[i].name+"</a>");
            similarArtistsList.append(newArtist);
        }
        similarArtists.append(similarArtistsList);

        // Create new div, with Bootstrap card body class, for the Bio card, create a text element (content from bio variable), put text element in new card body
        var bioCardBody = $("<div>").addClass("card-body").attr('id','bio-card-body');
        var bioCardBodyText = $("<p>").addClass("card-text").html(bio);
        bioCardBody.append(bioCardBodyText);

        // Declare & assign array variable to tags array from Last.fm response, sort info and arrange in new div with Bootstrap card body class
        var genres = d.tags.tag;
        var genreBody = $("<div>").addClass("card-body");
        genreBody.append($("<h2>").addClass("card-title").text("Genre(s)"));
        // sort through new array elements, put in new unordered list, put list in div genreBody
        var genreList = $("<ul>");
        for(var i=0; i<genres.length; i++) {
            var newGenre = $("<li>").html(genres[i].name);
            genreList.append(newGenre);
        }
        genreBody.append(genreList);

        // put bioCard in bioCardBody, put bioCardBody in Div with ID "bio", defined in HTML
        bioCard.append(bioCardBody);
        $("#bio").append(bioCard);

        // put genreBody and similarArtists in musicCard, put musicCard in div with id "music", defined in HTML
        musicCard.prepend(genreBody);
        musicCard.append(similarArtists);
        $("#music").append(musicCard);
    }

    // function to display information received from Deezer
    function showDeezerInfo(d) {
        // #bio-card created in showLastFMSearch
        
        // create new image with source of XL Picture from Deezer response, put on top of Bio card
        var artistImg = $("<img>").attr('src',d.picture_xl).addClass("card-img-top");
        $("#bio-card").prepend(artistImg);

        // create new div for card header, put on top of bio card, on top of the image
        var bioCardBodyTitle = $("<div>").addClass("card-header").text(d.name);
        $("#bio-card").prepend(bioCardBodyTitle);
    }

    // Search button on-click function
    $("#btnFetch").click(function(e) {
        e.preventDefault();

        // Declare & assign new variable to value of user input in Search input bar, and run function clickedSearch with that as parameter
        var search = $("#search-term").val();
        clickedSearch(search);
        
    });

    // On-click function for links found in similar Artists div
    $(document.body).on("click",".artist-link", function(e) {
        e.preventDefault();

        // Declare & assign new variable to text content of the link clicked by user, and run function clickedSearch with that as parameter
        var search = this.textContent;
        clickedSearch(search);
    });

    
    function clickedSearch(t) {
        // Reset the page to default content
        $("#bio").empty();
        $("#music").empty();

        // Run getData with parameter t, defined in either on-click function for a search or the link of a similar artist
        getData(t);
    }

    var cnt = 1;
    function changeColor() {
        // if cnt === 1 change initial css image
            if (cnt === 1) {
                $("h1").css("color", "aqua");
                $("h1").css("background-font-color", "blue");
                cnt = 2;
            }
            else {
                // change back to original image
                $("h1").css("color", "white");
                $("h1").css("background-font-color", "grey");
                cnt = 1;
            }
        }
        // start changeColor
        setInterval(changeColor, 3000);
});