# resourceful-simpledb

A SimpleDB back-end for Resourceful.

[![wercker status](https://app.wercker.com/status/f5d812d5116530b96a2c939d9dd06c43/m/master "wercker status")](https://app.wercker.com/project/bykey/f5d812d5116530b96a2c939d9dd06c43)

## Testing

To run the tests you'll need to add your AWS keys. This can be done by copying `config/environment.yaml` to `config/test.yaml` and adding your keys, before running `npm test`.

## Using the module

See the tests for some quick examples of how to use the library. More substantial help is available at the [Resourceful](https://npmjs.org/package/resourceful) site.

Note that each field of data is converted before being sent to SimpleDB so as to allow for sorting. For example, the number `42` will be converted to `number:0000000042`, to ensure that it is lower in the sort order than `2577689` (which would become `number:0002577689`). The data is converted again when being read so your application will never see the normalised data, but it does mean that if you are using other tools to view your data on SimpleDB you'll need to account for the datatypes.

For more information about this aspect of using SimpleDB, see [Working With Numerical Data](http://docs.aws.amazon.com/AmazonSimpleDB/latest/DeveloperGuide/NumericalData.html) in the AWS SimpleDB Developer Guide.
