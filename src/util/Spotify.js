const clientID = '8be2871d3d754f7f9f0f027933bd92c4';
const redirectURI = 'http://searchTrackz.surge.sh';

let accessToken;

const Spotify = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }
    else {
      if (window.location.href.match(/access_token=([^&]*)/)) {
        accessToken = window.location.href.match(/access_token=([^&]*)/)[1];
        const expiresIn = window.location.href.match(/expires_in=([^&]*)/)[1];
        window.setTimeout(() => accessToken = '', expiresIn * 1000);
        window.history.pushState('Access Token', null, '/');
      }
      else {
        window.location = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`
      }
    }
  },

  search(term) {
    if (!accessToken) {Spotify.getAccessToken();}
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: {Authorization: `Bearer ${accessToken}`}
    }).then(response => response.json()).then(jsonResponse => {
      if (jsonResponse.tracks) {
        return jsonResponse.tracks.items.map(track => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri
        }));
      }
    });
  },

  savePlaylist(playlistName, trackURIs) {
    if (!playlistName || !trackURIs) {return}
    else {
      if (!accessToken) {Spotify.getAccessToken();}
      const headers = {Authorization: `Bearer ${accessToken}`};
      let userID;

      return fetch('https://api.spotify.com/v1/me', {headers: headers}).then(response => response.json()).then(jsonResponse => {
        userID = jsonResponse.id;

        return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
          headers: headers,
          method: 'POST',
          body: JSON.stringify({name: playlistName})
        }).then(response => response.json()).then(jsonResponse => {
          let playlistID = jsonResponse.id;

          return fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, {
            headers: headers,
            method: 'POST',
            body: JSON.stringify({uris: trackURIs})
          }).then(response => response.json()).then(jsonResponse => {
            playlistID = jsonResponse.id;
          });
        });
      });
    }
  }

};

export default Spotify;
