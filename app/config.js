var convict = require('convict');
var _ = require('underscore');

var config = convict({
    app: {
        controllers: {
            format: Object,
            default: {}
        }
    },
    odm: {
        managers: {
            main: {
                connection: {
                    uri: {
                        formt: String,
                        default: ''
                    },
                    options: {
                        format: Object,
                        default: {}
                    }
                },
                models: {
                    format: Object,
                    default: {}
                },
                managers: {
                    format: Object,
                    default: {}
                }
            }
        }
    },
    import : {
        autoru: {
            baseUrl: {
                format: 'url',
                default: ''
            },
            startUri: {
                format: String,
                default: '/'
            },
            skip: {
                pages: {
                    format: Array,
                    default: []
                },
                manufacturers: {
                    format: Array,
                    default: []
                },
                names: {
                    format: Array,
                    default: []
                }
            },
            manufacturers: {
                format: Array,
                default: []
            }
        }
    }
});

config.loadFile(['./app/config/app.json', './app/config/import.json']);

config.validate();

// TODO: implement auto variables substitution for configs.
config.set('odm.managers.main.models.Core', __dirname + '/../' + config.get('odm.managers.main.models.Core'));
config.set('odm.managers.main.managers.Core', __dirname + '/../' + config.get('odm.managers.main.managers.Core'));
config.set('app.controllers.Core', __dirname + '/../' + config.get('app.controllers.Core'));

module.exports = config;
