var _ = require('underscore');
var should = require('should');
var assert = require('assert');
var schemaCombiner = require('../lib/schema-combiner');

describe('schema-combiner Module', function () {
    it('should combine two equal objects', function(done) {
        var object1 = {
            field1: 25,
            field2: 27,
            field3: null
        };

        var object2 = {
            field1: 29,
            field2: 52,
            field3: null
        };

        var result = schemaCombiner.buildCombinedDocumentSchema([object1, object2]);
        var expectedResult = {
            totals: {
                uniqueFieldCount: 3,
                fieldCount: 6,
            },
            fields: {
                field1: {
                    primitives: {
                        emptyCount: 0,
                        filledCount: 2
                    },
                    objects: {
                        count: 0,
                        fields: {}
                    }
                },
                field2: {
                    primitives: {
                        emptyCount: 0,
                        filledCount: 2
                    },
                    objects: {
                        count: 0,
                        fields: {}
                    }
                },
                field3: {
                    primitives: {
                        emptyCount: 2,
                        filledCount: 0
                    },
                    objects: {
                        count: 0,
                        fields: {}
                    }
                }
            }
        }

        assert.deepEqual(result, expectedResult);
        done();
    });

    it('should count fields in subdocuments', function(done) {
        var object1 = {
            field1: {
                field2: 3,
            }
        }

        var object2 = {
            field1: {}
        }

        var result = schemaCombiner.buildCombinedDocumentSchema([object1, object2]);
        var expectedResult = {
            totals: {
                uniqueFieldCount: 2,
                fieldCount: 3
            },
            fields: {
                field1: {
                    primitives: {
                        emptyCount:0,
                        filledCount:0
                    },
                    objects: {
                        count: 2,
                        fields: {
                            field2: {
                                primitives: {
                                    emptyCount: 0,   // It's non existing. It's not declared so it's not counted!   We might need to split so that we also can see if we may stringify it to a boolean i.e.
                                    filledCount: 1
                                },
                                objects: {
                                    count: 0,
                                    fields: {}
                                }
                            }
                        }
                    }
                }
            }
        }

        assert.deepEqual(result, expectedResult);
        done();
    });

    it('should count fields that have both subfields and values', function(done) {
        var object1 = {
            field: {
                subfield: 3
            }
        }

        var object2 = {
            field: 24
        }

        var object3 = {
            field: null
        }

        var object4 = {
            field: undefined
        }

        var result = schemaCombiner.buildCombinedDocumentSchema([object1, object2, object3, object4]);
        var expectedResult = {
            totals: {
                uniqueFieldCount: 2,
                fieldCount: 5
            },
            fields: {
                field: {
                    primitives: {
                        emptyCount:2, // null and undefined shall both be counted as empty!
                        filledCount:1
                    },
                    objects: {
                        count: 1,
                        fields: {
                            subfield: {
                                primitives: {
                                    emptyCount: 0,
                                    filledCount: 1
                                },
                                objects: {
                                    count: 0,
                                    fields: {}
                                }
                            }
                        }
                    }
                }
            }
        }

        assert.deepEqual(result, expectedResult);
        done();
    });


    it('should work recursive', function(done) {
        var object1 = {
            level1: {
                level2: {
                    level3: {
                        value: 10
                    }
                }
            }
        }

        var object2 = {
            level1: {
                level2: {
                    level3: {
                        value: 11
                    }
                }
            }
        }

        var result = schemaCombiner.buildCombinedDocumentSchema([object1, object2]);
        var expectedResult = {
            totals: {
                uniqueFieldCount: 4,
                fieldCount: 8
            },
            fields: {
                level1: {
                    primitives: {
                        emptyCount:0,
                        filledCount:0
                    },
                    objects: {
                        count: 2,
                        fields: {
                            level2: {
                                primitives: {
                                    emptyCount:0,
                                    filledCount:0
                                },
                                objects: {
                                    count: 2,
                                    fields: {
                                        level3: {
                                            primitives: {
                                                emptyCount:0,
                                                filledCount:0
                                            },
                                            objects: {
                                                count: 2,
                                                fields: {
                                                    value: {
                                                        primitives: {
                                                            emptyCount:0,
                                                            filledCount:2
                                                        },
                                                        objects: {
                                                            count: 0,
                                                            fields: {
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        assert.deepEqual(result, expectedResult);
        done();
    });

});
