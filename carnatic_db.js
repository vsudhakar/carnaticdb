BioCollection = new Mongo.Collection("bios");

if (Meteor.isClient) {
  Router.route('/', function(){
    this.render('Home');
  });

  Router.route('/update', function(){
    this.render('UpdateCreate');
  });

  Router.route("/search", function(){
    if (Session.get('cart') == null){
      //Set cart to an empty array
      var defaultCart = [];
      Session.set('cart', defaultCart);
    }
    console.log("Cart:");
    console.log(Session.get('cart'));

    var sessionCart = Session.get('cart');
    var sessionNames = [];

    for (item in sessionCart){
      var i =
        {
          id: sessionCart[item],
          name: BioCollection.findOne({ id: sessionCart[item] }).name
        };
      sessionNames.push(i);
    };

    this.render("Search", {
      data: {
        docs: sessionNames
      }
    });
  });

  Router.route("/search/:name", function() {
    var name_query = this.params.name;
    var query_results = BioCollection.find({name : {$regex : ".*"+name_query+".*"}}).fetch();
    // console.log(query_results);
    //Render results in template
    this.render('DisplayResults', {
      data: {
        results: query_results
      }
    });
  });

  Router.route("/artist", function() {
    this.render('DisplayArtist');
  });

  Router.route("/artist/:_id", function() {
    //Render artist by record ID
    Session.set('selectedArtist', this.params._id);
    var query_results = BioCollection.findOne({id: this.params._id});
    this.render('DisplayArtist', {
      data: {
        name: query_results.name,
        bio: query_results.bio
      }
    });
  });

  Router.route("/export", function() {
    var sessionCart = Session.get('cart');
    var sessionDocs = [];
    var sessionJSON = [];

    for (item in sessionCart){
      var i = BioCollection.findOne({ id: sessionCart[item] });
      sessionJSON.push(i);
      i = JSON.stringify(i);
      sessionDocs.push(i);
    };

    this.render('Export', {
      data: {
        jsonForm: sessionDocs,
        jsonData: sessionJSON
      }
    });
  });

  Template.accountScreen.rendered = function(){
    //On screen render
    $(".edit").hide();

    var currentUserId = Meteor.userId();
    var records = BioCollection.find({ id: currentUserId }).fetch();

    if (records.length == 0) {
      //Create records for user
      var defaultBioData =
        {
          id: currentUserId,
          name: "NULL",
          bio: "NULL",
          sampleRecordings: [],
          email: Meteor.user().emails[0].address
        };

      BioCollection.insert(defaultBioData);
    }
  };

  Template.accountScreen.helpers({
    'account_id': function(){
      var bioData = BioCollection.findOne({ id: Meteor.userId() });
      return bioData.id;
    },
    'account_name': function(){
      var bioData = BioCollection.findOne({ id: Meteor.userId() });
      return bioData.name;
    },
    'account_bio': function(){
      var bioData = BioCollection.findOne({ id: Meteor.userId() });
      return bioData.bio;
    },
    'account_email': function(){
      var bioData = BioCollection.findOne({ id: Meteor.userId() });
      return bioData.email;
    }
  });

  Template.accountScreen.events({
    'click #show_name': function(){
      //Edit name
      $("#edit_name").fadeIn();
      var bioData = BioCollection.findOne({ id: Meteor.userId() });
      $("#entry_name").val(bioData.name);
      $("#formSubmit").fadeIn();
    },
    'click #show_bio': function(){
      //Edit bio
      $("#edit_bio").fadeIn();
      var bioData = BioCollection.findOne({ id: Meteor.userId() });
      $("#entry_bio").val(bioData.bio);
      $("#formSubmit").fadeIn();
    },
    'click #cancel': function(){
      //Hide all edit fields
      $(".edit").fadeOut();
    },
    'click #update': function(){
      //Update the biodata record in the database
      var currentUserId = Meteor.userId();
      var bioData = BioCollection.findOne({ id: Meteor.userId() });
      var updatedBioData =
        {
          id: currentUserId,
          name: $("#entry_name").val(),
          bio: $("#entry_bio").val(),
          sampleRecordings: [],
          email: Meteor.user().emails[0].address
        };
      BioCollection.update(bioData._id, updatedBioData);
      console.log("Updated");
      $(".edit").hide();
    }
  });


  Template.Search.helpers({
    create: function(){

    },
    rendered: function(){

    },
    destroyed: function(){

    },
  });

  Template.Search.events({
    "click #search_name": function(event, template){
      //Submit and receive query
      var name_query = $("#search_entry_name").val();
      // window.location.replace("/search/"+name_query);
      Router.go('/search/'+name_query);
    },
    "click .removeCart": function(event, template){
      //Remove id from cart
      var doc_id = $(this).attr('id');
      console.log("Removing " + doc_id);
      var c = Session.get('cart');
      var i = c.indexOf(doc_id);
      c.pop(doc_id);
      Session.set('cart', c);
    },
    "click #exportCart": function(event, template){
      //Go to export template
      Router.go('/export');
    }
  });


  Template.DisplayArtist.helpers({
    create: function(){

    },
    rendered: function(){

    },
    destroyed: function(){

    },
  });

  Template.DisplayArtist.events({
    "click #addToCart": function(event, template){
       var sessionCart = Session.get('cart');
       sessionCart.push(Session.get('selectedArtist'));
       Session.set('cart', sessionCart);
       console.log("Added artist " + Session.get('selectedArtist') + " to cart.");
       console.log("Session cart");
       console.log(sessionCart);
    }
  });


}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
