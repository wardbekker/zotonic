/* feedback js
----------------------------------------------------------

@package:	Zotonic 2011	
@Author:	Marc Worrell <marc@worrell.nl>

Copyright 2011 Marc Worrell

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
 
http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

---------------------------------------------------------- */

$.widget("ui.feedback", 
{
	_init: function() 
	{
		var self = this;
		z_ensure_id(this.element);
		$('#'+this.options.trigger)
			.bind('keyup', function() { self.update(); })
			.bind('change', function() { self.update(); });
	},
	
	update: function() 
	{
		if (this.input_updater != undefined)
		{
			clearInterval(this.input_updater);
			this.input_updater = undefined;
		}
		
		var self = this;
		this.input_updater = setInterval(function()
		{
			// Fetch the update
			var args = [];
			var trigger = $('#'+self.options.trigger);
			if (trigger.prop('tagName').toLowerCase() == 'form') {
				args = trigger.formToArray();
			} else {
				var v = $.fieldValue(trigger, true);
				if (v && v.constructor == Array) {
					for(var j=0, jmax=v.length; j < jmax; j++)
						args.push({name: "triggervalue", value: v[j]});
				}
				else if (v !== null && typeof v != 'undefined')
					args.push({name: "triggervalue", value: v});
			}

			// Stop when there is an 'in-flight' update with the same args
			if (self.element.hasClass('loading')) {
				if (self.last_args == $.param(args)) {
					clearInterval(self.input_updater);
					self.input_updater = undefined;
				}
			} else {
				self.element.addClass('loading');
				self.last_args = $.param(args);
				clearInterval(self.input_updater);

                // Form changed, post it to the server
				var notify_args = {};
				for (var i=0; i<args.length; i++) {
				    notify_args[args[i].name] = args[i].value;
				}
				notify_args.z_trigger_id = self.options.trigger;
				notify_args.z_target_id  = $(self.element).attr('id');
				notify_args.z_delegate   = self.options.delegate;
				z_notify("feedback", notify_args);
			}
		}, self.options.timeout);
	}
});

$.ui.feedback.defaults = {
	delegate: undefined,
	trigger: undefined,
	template: undefined,
	timeout: 400
}
