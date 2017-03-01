

function bootstraptoolbar(htmlElement, customOptions) {
    var self = this;        // Reference for this object
    this.container;         // jQuery object of the selected HTML element
    this.options = {        // List of default options
        autoredraw: true,
        buttons: {},
        context: {},
        list: [],
        show: true,
    };

    // Global reference for this object
    var self_id = "bootstraptoolbar_" + String(Math.random()).substr(2);  // Create a random ID
    eval(self_id + " = this");  // Reference for this object in a var with name self_id


    this.addButton = function(name, button) {
        this.options.buttons[name] = button;
        // Redraw if set
        if(this.options.autoredraw)
            this.redraw();
    }
    this.addButtons = function(buttons) {
        var autoredraw = this.options.autoredraw;
        this.options.autoredraw = false;    // Disable temporarily
        // Add buttons
        if(typeof buttons === "object")
            for(name in buttons)
                this.addButton(name, buttons[name]);
        
        this.options.autoredraw = autoredraw;    // Restore
        if(autoredraw)
            this.redraw();
    }

    this.addOptions = function(newOptions) {
        // Incompatible data type
        if(typeof newOptions !== "object") return;

        // Iterate over newOptions
        for(var name in newOptions) {
            var attribute = newOptions[name];

            switch(name) {
                case "buttons":
                    // Merge buttons
                    this.addButtons(attribute);
                    break;
                default:
                    // Copy values to in options
                    this.options[attribute] = newOptions[attribute];
            }
        }

    }


    function createButtons(list, buttons, element, self_id) {
        var obj;
        var group = $("<div></div>", { class: "btn-group", role: "group" });

        for(var i in list) {
            var name = list[i];
            var button = buttons[name];

            if(name === "space") {
                element.append(group);
                group = $("<div></div>", { class: "btn-group", role: "group" });
                continue;
            }

            switch(typeof button) {
                case "string":
                    // Create an element with the HTML
                    group.append($(button));
                    break;
                case "object":
                    // Create button
                    obj = $('<button type="button" class="btn btn-default"></button>');

                    // If has icon
                    if("icon" in button) {
                        var icon = $("<span></span>", { class: button.icon });
                        obj.append(icon);
                        delete button.icon;
                    }
                    // If has text
                    if("text" in button) {
                        obj.append(" " + button.text);
                        delete button.text;
                    }
                    // Convert functions to string
                    for(attribute in button)
                        if(typeof button[attribute] === "function")
                            button[attribute] = "("+ button[attribute] + ")(" + self_id + ".options.context, " + self_id + ")";
                    
                    // Set attributes
                    obj.attr(button);

                    // Add button to the group
                    group.append(obj);
                    break;
                default:
                    throw "Wrong button type";
            }
        }

        // Append the last group
        element.append(group);
    }


    this.redraw = function() {
        // List of buttons
        var hasList = (this.options.list.length > 0);
        var list = (hasList ? this.options.list : this.options.list);
        for(var button in this.options.buttons) {
            var indexBefore = list.indexOf(this.options.buttons[button].before);    // Index of before
            var indexAfter = list.indexOf(this.options.buttons[button].after);      // Index of after
            if(indexBefore >= 0) list.splice(indexBefore, 0, button);               // Insert before
            else if(indexAfter >= 0) list.splice(indexAfter + 1, 0, button);        // Insert after
            else if(!hasList && list.indexOf(button) < 0) list.push(button);        // Push if not present
        }

        // Clear container
        this.container.empty();

        // Create buttons
        createButtons(list, this.options.buttons, this.container, self_id);
    }


    this.create = function() {
        this.container = $('<nav class="navbar navbar-default"></div>');
        $(htmlElement).append(this.container);
    }

    var autoredraw = this.options.autoredraw;
    this.options.autoredraw = false;        // Disable temporarily
    this.addOptions(customOptions);
    this.create();

    this.options.autoredraw = autoredraw;   // Restore
    if(autoredraw)
        this.redraw();
}

jQuery.fn.extend({
    toolbar: function(options) {
        // If custom options not provided
        if(typeof options === "undefined")
            options = {};

        return this.each(function () {
            // Deep copy of options
            return new bootstraptoolbar(this, jQuery.extend(true, {}, options));
        });
    }
});
