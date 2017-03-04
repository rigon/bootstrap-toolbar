/**************************************************************************
 * Customizable toolbars for Bootstrap - https://github.com/rigon/bootstrap-toolbar
 * Copyright (C) 2017  rigon<ricardompgoncalves@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *************************************************************************/

function bootstraptoolbar(htmlElement, customOptions) {
	var self = this;	// Reference for this object
	this.container;		// jQuery object of the selected HTML element
	this.options = {	// List of default options
		autoredraw: true,
		buttons: {},
		context: {},
		list: [],
		show: true,
	};

	// Global reference for this object
	var self_id = "bootstraptoolbar_" + String(Math.random()).substr(2); // Create a random ID
	eval(self_id + " = this"); // Reference for this object in a var with name self_id


	this.addButton = function (name, button) {
		this.options.buttons[name] = button;
		// Redraw if set
		if (this.options.autoredraw)
			this.redraw();
	}
	this.addButtons = function (buttons) {
		var autoredraw = this.options.autoredraw;
		this.options.autoredraw = false;		// Disable temporarily
		// Add buttons
		if (typeof buttons === "object")
			for (name in buttons)
				this.addButton(name, buttons[name]);

		this.options.autoredraw = autoredraw;	// Restore
		if (autoredraw)
			this.redraw();
	}

	this.addOptions = function (newOptions) {
		// Incompatible data type
		if (typeof newOptions !== "object") return;

		// Iterate over newOptions
		for (var name in newOptions) {
			var newValue = newOptions[name];

			switch (name) {
				case "buttons":
					// Merge buttons
					this.addButtons(newValue);
					break;
				default:
					// Copy values to in options
					this.options[name] = newValue;
			}
		}
	}


	function createButtons(list, buttons, element, self_id) {
		var group = $("<div></div>", { class: "btn-group", role: "group" });

		for (var i in list) {
			var name = list[i];
			var button = buttons[name];

			if (name === "space") {
				element.append(group);
				group = $("<div></div>", { class: "btn-group", role: "group" });
				continue;
			}

			var widget;
			switch (typeof button) {
				case "string": widget = "html"; break;
				case "object": widget = ("widget" in button ? button.widget : "button"); break;
			}

			switch (widget) {
				case "html":
					// Create an element with the HTML
					group.append(button);
					break;
				case "button":
					// Create button
					var obj = $('<button type="button" class="btn btn-default"></button>');

					// If has icon
					if ("icon" in button) {
						var icon = $("<span></span>", { class: button.icon });
						obj.append(icon);
						delete button.icon;
					}
					// If has text
					if ("text" in button) {
						obj.append(" " + button.text);
						delete button.text;
					}
					// Convert functions to string
					for (attribute in button)
						if (typeof button[attribute] === "function")
							button[attribute] = "(" + button[attribute] + ")(" + self_id + ".options.context, " + self_id + ")";

					// Set attributes
					obj.attr(button);

					// Add button to the group
					group.append(obj);
					break;
				case "dropdown":
				case "dropup":
					// Create button
					var dropdown_group = $('<div class="btn-group" role="group"></div>');
					var dropdown_button = $('<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>');
					var dropdown_list = $('<ul class="dropdown-menu"></ul>');

					if(widget === "dropup")
						dropdown_group.addClass("dropup");

					// If has icon
					if ("icon" in button) {
						var icon = $("<span></span>", { class: button.icon });
						dropdown_button.append(icon);
						delete button.icon;
					}
					// If has text
					if ("text" in button) {
						dropdown_button.append(" " + button.text);
						delete button.text;
					}
					// Add caret
					dropdown_button.append(' <span class="caret"></span>');

					// Add list of options
					for(var i in button.list) {
						var dropdown_option = button.list[i];
						var dropdown_option_li = $('<li></li>');

						// If has icon
						if ("icon" in dropdown_option) {
							var icon = $("<span></span>", { class: dropdown_option.icon });
							dropdown_option_li.append(dropdown_option.icon);
							delete dropdown_option.icon;
						}

						// If has text
						if ("text" in dropdown_option) {
							dropdown_option_li.append(" " + dropdown_option.text);
							delete dropdown_option.text;
						}
						// Set attributes
						dropdown_option_li.attr(dropdown_option);

						// Add to dropdown list
						dropdown_list.append(dropdown_option_li);
					}
					
					// Set attributes
					dropdown_group.attr(button);

					dropdown_group.append(dropdown_button);
					dropdown_group.append(dropdown_list);
					group.append(dropdown_group);
					break;
				case "input":
					var input_group = $('<div class="input-group"></div>');
					var input_element = $('<input class="form-control">');
					
					// Add prefix addon
					if("prefix" in button) {
						var input_prefix = $('<span class="input-group-addon"></span>');
						input_prefix.html(button.prefix);
						input_group.append(input_prefix);
						delete button.prefix;
					}
					
					// Add input
					input_group.append(input_element);

					// Add sufix addon
					if("sufix" in button) {
						var input_sufix = $('<span class="input-group-addon"></span>');
						input_sufix.html(button.sufix);
						input_group.append(input_sufix);
						delete button.sufix;
					}

					// Set attributes
					input_element.attr(button);

					group.append(input_group);
					break;
				default:
					throw "Wrong widget button type";
			}
		}

		// Append the last group
		element.append(group);
	}


	this.redraw = function () {
		// List of buttons
		var hasList = (this.options.list.length > 0);
		var list = (hasList ? this.options.list : this.options.list);
		for (var button in this.options.buttons) {
			var indexBefore = list.indexOf(this.options.buttons[button].before);	// Index of before
			var indexAfter = list.indexOf(this.options.buttons[button].after);		// Index of after
			if (indexBefore >= 0) list.splice(indexBefore, 0, button);				// Insert before
			else if (indexAfter >= 0) list.splice(indexAfter + 1, 0, button);		// Insert after
			else if (!hasList && list.indexOf(button) < 0) list.push(button);		// Push if not present
		}

		// Clear container
		this.container.empty();

		// Create buttons
		createButtons(list, this.options.buttons, this.container, self_id);
	}


	this.create = function () {
		this.container = $('<nav class="navbar"></div>');
		$(htmlElement).append(this.container);
	}

	var autoredraw = this.options.autoredraw;
	this.options.autoredraw = false;		// Disable temporarily

	this.addOptions(customOptions);
	this.create();

	this.options.autoredraw = autoredraw;	// Restore
	if (autoredraw)
		this.redraw();
}

jQuery.fn.extend({
	toolbar: function (options) {
		// If custom options not provided
		if (typeof options === "undefined")
			options = {};

		return this.each(function () {
			// Deep copy of options
			return new bootstraptoolbar(this, jQuery.extend(true, {}, options));
		});
	}
});
