(function() {
    require([
            "app/app",
            "dojo/parser",
            "dojo/domReady!"
        ],
        function(app, parser) {
            parser.parse();
            app.init();
            $('[data-toggle="tooltip"]').tooltip(); 
        });
})();
