angular.module('ethExplorer')
    .controller('mainCtrl', function ($rootScope, $scope, $location) {

	var web3 = $rootScope.web3;
	var maxBlocks = 30; // TODO: into setting file or user select
	var blockNum = $rootScope.blockNum = parseInt(web3.eth.blockNumber, 10);
	if (maxBlocks > blockNum) {
	    maxBlocks = blockNum + 1;
	}
    
    var promiseArray = [];
	for (var i = 0; i < maxBlocks; ++i) {
	    promiseArray.push(getBlockAsync(blockNum - i));
    }
    
    Promise.all(promiseArray).then(result => {
	$rootScope.blocks = [];
        $rootScope.blocks = $rootScope.blocks.concat(result);
    });
    
    $scope.updateBlocks = () => {
        var prevBlockNumber = $rootScope.blockNum;
        var currentBlockNumber = parseInt(web3.eth.blockNumber, 10);
        console.log('bef', prevBlockNumber,currentBlockNumber)
        if(prevBlockNumber < currentBlockNumber) {
            maxBlocks = 30;
            if (maxBlocks > currentBlockNumber) {
                maxBlocks = currentBlockNumber + 1;
            }
            var promiseArray = [];
            for (var i = 0; i < maxBlocks; ++i) {
                promiseArray.push(getBlockAsync(currentBlockNumber - i));
            }

            Promise.all(promiseArray).then(result => {
                console.log('after', $rootScope.blockNum, currentBlockNumber, result)
                if($rootScope.blockNum < currentBlockNumber) {
                    $rootScope.blockNum = currentBlockNumber;
                    $rootScope.blocks = result;
		    $scope.$apply();
                }
            });
        }
    }

    setInterval($scope.updateBlocks, 3000);
	
        $scope.processRequest = function() {
             var requestStr = $scope.ethRequest.split('0x').join('');

            if (requestStr.length === 40)
              return goToAddrInfos(requestStr)
            else if(requestStr.length === 64) {
              if(/[0-9a-zA-Z]{64}?/.test(requestStr))
                return goToTxInfos('0x'+requestStr)
              else if(/[0-9]{1,7}?/.test(requestStr))
                return goToBlockInfos(requestStr)
            }else if(parseInt(requestStr) > 0)
              return goToBlockInfos(parseInt(requestStr))

            alert('Don\'t know how to handle '+ requestStr)
        };


        function goToBlockInfos(requestStr) {
            $location.path('/block/'+requestStr);
        }

        function goToAddrInfos(requestStr) {
            $location.path('/address/'+requestStr);
        }

         function goToTxInfos (requestStr) {
             $location.path('/transaction/'+requestStr);
        }

        function getBlockAsync(blockNum) {
            return new Promise((resolve, reject) => {
                web3.eth.getBlock(blockNum, (error, result) => { 
                    if(error) reject();
                    resolve(result);
                })
            })
        }

    });
