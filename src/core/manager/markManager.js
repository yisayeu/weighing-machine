/**
 * Mark manager.
 *
 * @class
 * @name Core.Manager.MarkManager
 * @param {Odm.Manager}
 */
var MarkManager = function (om) {
    var Mark = om.getModel('Core:Mark');

    function apply(car, update, done) {
        Mark.findOne({car: car}).exec(function (err, mark) {
            if (err) {
                throw err;
            }

            if (!mark) {
                mark = new Mark({car: car});
            }

            update(mark);

            mark.save(function (err) {
                if (err) {
                    throw err;
                }

                done();
            });
        });
    };

    function vote(car, amount, callback) {
        apply(car, function (mark) {
            mark.votes += amount;
        }, callback);
    };

    function check(car, value, callback) {
        apply(car, function (mark) {
            mark.isChecked = value;
        }, callback);
    };

    return {
        voteUp: function (car, callback) {
            vote(car, 1, callback);
        },

        voteDown: function (car, callback) {
            vote(car, -1, callback);
        },

        check: function (car, callback) {
            check(car, true, callback);
        },

        uncheck: function (car, callback) {
            check(car, false, callback);
        }
    };
};

module.exports.MarkManager = MarkManager;