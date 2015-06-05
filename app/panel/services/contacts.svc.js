/**
 * Created by tmakin on 26/10/14.
 */
'use strict';
/* Services */
(function () {

  var url = "/data/contacts";

  var ContactsService = function ($http, Bloodhound) {

    var service = {
      data: null
    };

    var contacts = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      limit: 6,
      prefetch: {
        // url points to a json file that contains an array of country names, see
        // https://github.com/twitter/typeahead.js/blob/gh-pages/data/countries.json
        url: url
        // the json file contains an array of strings, but the Bloodhound
        // suggestion engine expects JavaScript objects so this converts all of
        // those strings
        //filter: function(list) {
        //  return $.map(list, function(country) { return { name: country }; });
        //}
      }
    });

    contacts.initialize();

    //public API
    service.get = function (query) {
      var result = [];
      contacts.get(query, function(data) {

        //copy the contents into the result data array
        for(var i = 0 ; i < data.length; i++) {
          if(i < result.length) {
            result[i] = data[i]; //assign to existing index
          } else {
            result.push(data[i]); //otherwise push to end of array
          }
        }

        //make sure they match
        result.length = data.length;
      });
      return result; //return array by reference
    };

    return service;
  };

  angular.
    module('rm').
    factory('Contacts', ContactsService);
})();/**
 * Created by tmakin on 30/11/14.
 */
