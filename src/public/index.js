/* global  angular, createSubscriptionEntity, createInvoiceEntity, createPlanEntity */

var mockAdmin = angular.module('mockAdmin', ['ng-admin'])

mockAdmin.directive('callSubscriptionActionButton', [
  '$http', '$state', 'adminApp', 'notification',
  function ($http, $state, adminApp, notification) {
    return {
      restict: 'E',
      scope: {
        subscription: '=',
        action: '@',
        size: '@'
      },
      transclude: true,
      link: function (scope, element, attrs) {
        var entityName = scope.subscription.entityName

        scope.callAction = function () {
          $http
            .post([
              adminApp.getEntity(entityName).baseApiUrl(),
              entityName,
              '/',
              scope.subscription.identifierValue,
              '/',
              scope.action
            ].join(''))
            .then(function () {
              $state.reload()
            })
            .then(function () {
              notification.log('Performed action ' + scope.action, {
                addnCls: 'humane-flatty-success'
              })
            })
            .catch(function (e) {
              notification.log('A problem occurred, please try again', {
                addnCls: 'humane-flatty-error'
              })
              console.error(e)
            })
        }
      },
      template: '<a class="btn btn-default" ng-class="size ? \'btn-\' + size : \'\'" ng-click="callAction()" ng-transclude></a>'
    }
  }
])

mockAdmin.directive('requestSubscriptionCancelationButton', function () {
  return {
    restict: 'E',
    scope: {
      subscription: '=',
      size: '@'
    },
    template: '<call-subscription-action-button size="{{ size }}" subscription="subscription" action="cancel">Request Cancelation</call-subscription-action-button>'
  }
})

mockAdmin.directive('expireSubscriptionButton', function () {
  return {
    restict: 'E',
    scope: {
      subscription: '=',
      size: '@'
    },
    template: '<call-subscription-action-button size="{{ size }}" subscription="subscription" action="expire">Expire</call-subscription-action-button>'
  }
})

mockAdmin.config(['$provide', 'NgAdminConfigurationProvider', function ($provide, nga) {
  var admin = nga.application('HTTP Mock Server')
    .baseApiUrl('/')

  $provide.value('adminApp', admin)

  var subscription = createSubscriptionEntity(nga)
  var invoice = createInvoiceEntity(nga)
  var plan = createPlanEntity(nga)

  admin.addEntity(subscription)
  admin.addEntity(invoice)
  admin.addEntity(plan)

  nga.configure(admin)
}])
