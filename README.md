gnd-dropdown
============

A dropdown (as html select) component for Gnd.

It supports binding a collection to the options and a model to the current
selection.

Install
=======

    npm install gnd-dropdown
    

Usage
=====

In a nodejs server:

    var Dropdrown = require('gnd-dropdown');

    // Dropdown.build points to the directory with the files to server
    
    // using connect / express
    app.use(static(path.join(__dirname, Dropdown.build)))
    
  
In the client:

    // simple collection
    var dropdown = new Dropdown(myCollection, {
      selectedId: mySelectedId,
      parent: '#dropdown'
    });
    dropdown.render();
    
    // binding the selected item id to some model property
    var dropdown = new Dropdown(myCollection, {
      selection: {model: myModel, key: 'itemId'},
      parent: '#dropdown'
    });
    dropdown.render();

    // Listen to changes
    dropdown.on('selected:', function(item){
      console.log(item);
    });
    
    // Do something special when last element is deleted
    dropdown.on('lastRemoved:', function(item){
      // ---
    })
  

    