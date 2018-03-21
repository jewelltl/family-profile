/**
 * Created by Administrator on 12/8/2015.
 */

"use strict";

// require all nested models

var models = [
	'profile.js',
	'user.js',
	'tbuser.js'
];

var l = models.length;
for (var i = 0; i < l; i++) {
    var model = "./" + models[i];
    require(model)();
}
