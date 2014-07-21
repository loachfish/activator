define([
  "services/fs",
  'ace/ace'
],function(
  fs,
  ace
){

  var documentState = function(doc){
    var self = this;
    self.isText = true;
    self.title = doc.title;
    self.location = doc.location;
    self.active = ko.observable(false); // == displayed document
    self.body = ko.observable("loading");

    // Indicates a network activity on the file
    self.working = ko.observable(0);

    // Used for hilighting
    self.mode = highlightModeFor(self.location);
    // Ace document & session
    self.session = new ace.EditSession(self.body(), 'ace/mode/'+self.mode);
     // Ace undo history
    self.session.setUndoManager(new ace.UndoManager());

    // Sync Ace content with local value
    self.edited = ko.observable(false);
    self.body.on("change", function(value) {
      // TODO: check if document is edited, then ask for confirmation
      self.session.setValue(value);
    });

    // Annotation (error, warning...)
    self.annotations = ko.observable([]);
    self.annotations.on("change", function(_) {
      self.session.setAnnotations(_.map(function(m) {
        // Translate sbt error kinds, to ace annotations types
        var aceLevel = m.kind == 'error' ? 'error': m.kind == 'warn' ? 'warning': 'info';
        return {
          row: m.line - 1, // Ace count from zero
          column: 0,
          text: m.message,
          type: aceLevel
        }
      }));
    });

    // Save document
    self.save = function(callback){
      self.working(self.working()+1);
      var content = self.session.getValue();
      fs.save(self.location, content, function() {
        self.body(content);
        self.working(self.working()-1);
      });
    }

    // Get saved version
    self.restore = function(){
      self.working(self.working()+1);
      fs.get(self.location, function(data) {
        self.body(data, true);
        self.working(self.working()-1);
      });
    }
    // self.restore(); // Getting the server version right away

    // Move == Rename
    self.move = function(newLocation){
      self.working(self.working()+1);
      fs.moveFile(self.location, newLocation, function() {
        self.working(self.working()-1);
        // More to do... in the tree
      });
    }

    // Formatting:
    self.chosenSoftTabs = ko.observable(true);
    doOnChange(self.chosenSoftTabs, function(t) {
      self.session.setUseSoftTabs(t);
    });

    self.tabSizes = [1,2,3,4,8];
    self.chosenTabSize = ko.observable(2);
    doOnChange(self.chosenTabSize, function(t) {
      self.session.setTabSize(t);
    });
  }

  function highlightModeFor(filename) {
    var ext = filename.split('.').pop().toLowerCase();
    if (ext == "scala" || ext == "sbt") return "scala";
    if (ext == "java") return "java";
    if (ext == "js") return "javascript";
    if (ext == "html") return "html";
    if (ext == "css") return "css";
    if (ext == "json") return "json";
    if (ext == "xml") return "xml";
    if (ext == "clj") return "clojure";
    if (ext == "dart") return "dart";
    if (ext == "erl") return "erlang";
    if (ext == "groovy") return "groovy";
    if (ext == "haml") return "haml";
    if (ext == "hs") return "haskell";
    if (ext == "latex") return "latex";
    if (ext == "less") return "less";
    if (ext == "ls") return "livescript";
    if (ext == "md") return "markdown";
    if (ext == "py") return "python";
    if (ext == "rb") return "ruby";
    if (ext == "rs") return "rust";
    if (ext == "sass") return "sass";
    if (ext == "scss") return "scss";
    if (ext == "sql") return "sql";
    if (ext == "styl") return "stylus";
    if (ext == "svg") return "svg";
    if (ext == "textile") return "textile";
    if (ext == "ts") return "typescript";
    if (ext == "yaml") return "yaml";
    return "text";
  }

  return documentState;

})