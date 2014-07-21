define([
  "services/sbt",
  "core/plugins",
  "text!./tasks.html",
  "css!./tasks",
  "css!widgets/modules/modules"
], function(
  sbt,
  plugins,
  tpl
) {

  var State = {
    memoTaskScroll: ko.observable(),
    memoLogsScroll: ko.observable(),
    sbt: sbt,
    clear: function() {
      sbt.logs.logs([]);
      sbt.tasks.executions.all([]);
    }
  };

  return {
    render: function(){
      return bindhtml(tpl, State)
    }
  }

});