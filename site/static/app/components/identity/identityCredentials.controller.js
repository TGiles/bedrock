/*!
 * Identity Credentials UI.
 *
 * Copyright (c) 2012-2014 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define([], function() {

'use strict';

var deps = [
  '$scope', 'config', '$http', '$location', '$sanitize', 'svcIdentity'];
return {
  controller: {IdentityCredentialsCtrl: deps.concat(factory)},
  routes: [{
    path: window.data.identityBasePath,
    options: {
      title: 'Identity Credentials',
      templateUrl: '/app/components/identity/identity-credentials.html'
    }
  }]
};

function factory($scope, config, $http, $location, $sanitize, svcIdentity) {
  var model = $scope.model = {};
  model.loading = false;
  model.feedback = {};
  model.identity = svcIdentity.identity;
  model.identityCredentials = config.data.identityCredentials;

  model.authorize = function(accept) {
    // TODO: modify query to reflect user's choices from UI
    var query;
    if(accept) {
      query = model.identityCredentials.query;
    }
    else {
      query = {'@context': 'https://w3id.org/identity/v1'};
    }
    model.loading = true;
    Promise.cast($http.post($location.absUrl() + '&authorize=true', {
      query: JSON.stringify(query)
    })).then(function(response) {
      // TODO: support no callback case
      // submit response to callback
      response = $sanitize(JSON.stringify(response.data));
      var form = document.createElement('form');
      form.setAttribute('method', 'post');
      form.setAttribute('action', model.identityCredentials.callback);
      form.innerHTML =
        '<input type="hidden" name="response" value="' + response + '" />';
      form.submit();
    }).catch(function(err) {
      model.loading = false;
      model.feedback.error = err;
      $scope.$apply();
    });
  };

  function refresh(force) {
    var opts = {force: !!force};
  }
  $scope.$on('refreshData', function() {
    refresh(true);
  });
  refresh();
}

});
