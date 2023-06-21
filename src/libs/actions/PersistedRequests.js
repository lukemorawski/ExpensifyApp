import Onyx from 'react-native-onyx';
import _ from 'underscore';
import removeElement from 'lodash/remove';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import HttpUtils from '../HttpUtils';

let persistedRequests = [];

Onyx.connect({
    key: ONYXKEYS.PERSISTED_REQUESTS,
    callback: (val) => (persistedRequests = val || []),
});

function clear() {
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, []);
}

/**
 * @param {Array} requestsToPersist
 */
function save(requestsToPersist) {
    HttpUtils.cancelPendingReconnectAppRequest();
    persistedRequests = _.chain(persistedRequests)
        .concat(requestsToPersist)
        .partition((request) => request.command !== CONST.NETWORK.COMMAND.RECONNECT_APP)
        .flatten()
        .value();
    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, persistedRequests);
}

/**
 * Remove a request from the persisted requests array.
 * Removes first record from the array that matches the requestToRemove param.
 * @param {Object} requestToRemove - The request to remove
 */
function remove(requestToRemove) {
    const indexToRemove = _.findIndex(persistedRequests, (persistedRequest) => _.isEqual(persistedRequest, requestToRemove));
    if (indexToRemove !== -1) {
        removeElement(persistedRequests, (__, index) => index === indexToRemove);
    }

    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, persistedRequests);
}

/**
 * Removes all matching requests from the persisted requests array.
 * @param {Object} requestToRemove - The request to remove
 */
function removeAllMatching(requestToRemove) {
    persistedRequests = _.reject(persistedRequests, (persistedRequest) => _.isEqual(persistedRequest, requestToRemove));

    Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, persistedRequests);
}

/**
 * @returns {Array}
 */
function getAll() {
    return persistedRequests;
}

export { clear, getAll, remove, removeAllMatching, save };
