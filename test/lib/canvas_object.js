
var testCase         = require('nodeunit').testCase,
    it               = require('../test_helper').it,
    db               = require('../test_helper').db,
    ObjectID         = require('mongodb').ObjectID,
    Project          = require('../../lib/project').Project,
    Page             = require('../../lib/page').Page;
    CanvasObject     = require('../../lib/canvas_object').CanvasObject;

exports.canvas_object = testCase({

	setUp: function (callback) {
		// Clear out the projects collection.
		db.open(function(err, p_db) {
			db.dropCollection('projects', function(err) {
				callback();
			});
		});
	},

	tearDown: function (callback) {
		callback();
	},

	"create: creates a new canvas object": function(test) {
		Project.create(function(project) {
			Page.create(project, function(page) {
				CanvasObject.create(page, { canvas_object: {} }, function(canvas_object) {
					test.equal(canvas_object.error, undefined);
					test.done();
				});
			});
		});
	},

	"create: adds template_id, top, and left to new canvas objects": function(test) {
		Project.create(function(project) {
			Page.create(project, function(page) {
				CanvasObject.create(page, { canvas_object: { template_id: 'paragraph', top: 100, left: 50 } }, function(canvas_object) {
					test.equal(canvas_object.error, undefined);
					test.equal(canvas_object.top, 100);
					test.equal(canvas_object.left, 50);
					test.equal(canvas_object.template_id, 'paragraph');
					test.done();
				});
			});
		});
	},

	"create: updates the canvas_objects_created counter": function(test) {
		Project.create(function(project) {
			test.equal(project.canvas_objects_created, 0);
			Page.create(project, function(page) {
				CanvasObject.create(page, { canvas_object: {} }, function(canvas_object) {
					Project.find_by_id(project._id, function(project) {
						test.equal(project.canvas_objects_created, 1);
						test.done();
					});
				});
			});
		});
	},

	"create: returns an error when the page doesn't exist": function(test) {
		Project.create(function(project) {
			Page.find_by_id_and_project_id('this-id-does-not-exist', project._id, function(page) {
				CanvasObject.create(page, { canvas_object: {} }, function(canvas_object) {
					test.notEqual(canvas_object.error, undefined);
					test.done();
				});
			});
		});
	},

	"update: updates the top and left attributes of a canvas object": function(test) {
		Project.create(function(project) {
			Page.create(project, function(page) {
				CanvasObject.create(page, { canvas_object: { template_id: 'paragraph', top: 100, left: 50 } }, function(canvas_object) {
					canvas_object.update({ top: 150, left: 150 }, function(updated_canvas_object) {
						test.equal(updated_canvas_object.top, 150);
						test.equal(updated_canvas_object.left, 150);
						test.done();
					});
				});
			});
		});
	},

	"update: does not update uneditable attributes of a canvas object": function(test) {
		Project.create(function(project) {
			Page.create(project, function(page) {
				CanvasObject.create(page, { canvas_object: { template_id: 'paragraph', top: 100, left: 50 } }, function(canvas_object) {
					canvas_object.update({ uneditable: 'hello' }, function(updated_canvas_object) {
						test.equal(updated_canvas_object.uneditable, undefined);
						test.done();
					});
				});
			});
		});
	},

	"delete: returns the canvas_object it deleted from a project": function(test) {
		Project.create(function(project) {
			Page.create(project, function(page) {
				CanvasObject.create(page, { canvas_object: {} }, function(canvas_object) {
					canvas_object.delete(function(deleted_canvas_object) {
						test.equal(JSON.stringify(canvas_object), JSON.stringify(deleted_canvas_object));
						test.done();
					});
				});
			});
		});
	},

	"delete: after deletion canvas_object should not exist": function(test) {
		Project.create(function(project) {
			Page.create(project, function(page) {
				CanvasObject.create(page, { canvas_object: {} }, function(canvas_object) {
					canvas_object.delete(function(deleted_canvas_object) {
						Page.find_by_id_and_project_id(page.id, page.project._id, function(page) {
							CanvasObject.find(deleted_canvas_object.id, page, function(canvas_object) {
								test.equal(canvas_object.error, '404');
								test.done();
							});
						});
					});
				});
			});
		});
	},

	"CanvasObject.find: returns a canvas_object": function(test) {
		Project.create(function(project) {
			Page.create(project, function(page) {
				CanvasObject.create(page, { canvas_object: { template_id: 'paragraph', top: 100, left: 50 } }, function(canvas_object) {
					Page.find_by_id_and_project_id(page.id, page.project._id, function(found_page) {
						CanvasObject.find(canvas_object.id, found_page, function(found_canvas_object) {
							test.equal(found_canvas_object.error, undefined);
							test.equal(found_canvas_object.page.error, undefined);
							test.done();
						});
					});
				});
			});
		});
	},

	"CanvasObject.find: returns an error if canvas_object not found ": function(test) {
		Project.create(function(project) {
			Page.create(project, function(page) {
				CanvasObject.create(page, { canvas_object: { template_id: 'paragraph', top: 100, left: 50 } }, function(canvas_object) {
					Page.find_by_id_and_project_id(page.id, page.project._id, function(found_page) {
						CanvasObject.find('invalid id', found_page, function(found_canvas_object) {
							test.equal(found_canvas_object.error, '404');
							test.done();
						});
					});
				});
			});
		});
	},

	"CanvasObject.find: returns an error if page not found ": function(test) {
		Project.create(function(project) {
			Page.create(project, function(page) {
				CanvasObject.create(page, { canvas_object: { template_id: 'paragraph', top: 100, left: 50 } }, function(canvas_object) {
					Page.find_by_id_and_project_id(page.id, page.project._id, function(found_page) {
						CanvasObject.find(canvas_object.id, 'invalid', function(found_canvas_object) {
							test.equal(found_canvas_object.error, '404');
							test.done();
						});
					});
				});
			});
		});
	},

});

