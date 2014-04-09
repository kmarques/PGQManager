/**
 * Created by kmarques on 04/04/14.
 */
$(document).ready(function () {

  var options = [];

  var flashmessage = function (sMessage, sClass) {

    var div = $('<div class="alert alert-' + sClass + ' alert-dismissable">'
      + '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'
      + '<strong>' + sClass.toUpperCase() + '!</strong> ' + sMessage
      + '</div>');
    $(div).prependTo('div.main-content').delay(2000).fadeOut(400, function () {
      $(this).remove()
    });
  }

  $('#queueFilter').on('change', function () {
    var qfilter = $(this).val();
    options.sort(function (a, b) {
      return $(b).val() - $(a).val();
    });
    $('#consumerFilter').append(options);
    options = [];

    if (qfilter != -1) {
      var filteredOptions = $('#consumerFilter').find(':not([value^="' + qfilter + '"], [value=-1])');

      $.each(filteredOptions, function () {
        options.push($(this).clone());
        $(this).remove();
      });

      $.ajax({
        url: Routing.generate('_main_default_queueinfo'),
        type: "POST",
        data: 'id=' + qfilter,
        dataType: 'json',
        success: function (json) {
          $('div.sidebar-right > #queueInfo > div.content').text(json);
          $('div.sidebar-right').animate({width: "+20%"}, 800);
          console.log(json);
        }
      });
    }

  });

  $('#consumerFilter').on('change', function () {
    var cfilter = $(this).val();

    if (cfilter != -1) {

      $.ajax({
        url: Routing.generate('_main_default_consumerinfo'),
        type: "POST",
        data: 'id=' + cfilter,
        dataType: 'json',
        success: function (json) {
          $('div.sidebar-right > #consumerInfo > div.content').text(json);
          console.log(json);
        }
      });
    }

  });

  function fnFormatDetails(nTr) {
    var aData = datatable.fnGetData(nTr);
    var sOut = '<table style="padding-left:50px;background-color: navajowhite; word-break: break-all">';
    sOut += '<tr data-clickable="false"><td>' + aData['ev_data'] + '</td></tr>';
    sOut += '</table>';

    return sOut;
  }

  var customSearchData = new Array();
  var datatable = $('table.ajax.datatable').dataTable({
    "bProcessing": true,
    "bServerSide": true,
    "iDeferLoading": 0,
    "sAjaxSource": $(this).data('uri'),
    "sServerMethod": "POST",
    "fnServerData": function (sSource, aoData, fnCallback) {
      var $this = $(this);

      $.each(customSearchData, function (index, item) {
        aoData.push({ "name": item.name, "value": item.value });
      });

      $.ajax({
        url: $(this).data('uri'),
        type: 'POST',
        dataType: 'json',
        data: aoData,
        success: function (json) {
          $this.parents('div[name^="table-event-"]').fadeIn();

          fnCallback(json);
          refresh();
        }
      });

    },
    "aoColumns": [
      { "mData": "ev_id" },
      { "mData": "ev_failed_time" },
      { "mData": "ev_time" },
      { "mData": "ev_retry", "bSortable": false },
      { "mData": "ev_type", "bSortable": false },
      { "mData": "action", "bSortable": false }
    ],
    "aaSorting": [
      [ 2, "desc" ]
    ],
    "fnRowCallback": function (nRow, aData, iDisplayIndex) {
      /* Append the grade to the default row class name */
      var td =
        '<a class="table-event-action" href="#" data-action="retry"><span class="glyphicon glyphicon-refresh"></span></a>'
          + '<a class="table-event-action" href="#" data-action="edit"><span class="glyphicon glyphicon-pencil"></span></a>'
          + '<a class="table-event-action" href="#" data-action="delete"><span class="glyphicon glyphicon-remove"></span></a>';

      $(nRow).attr('data-clickable', 'true');
      $(nRow).find('td:last-child').html($(td));
    }
  })
    .on('click', 'tbody > tr[data-clickable=true]', function (e) {
      if (e.originalEvent.srcElement.nodeName.toLowerCase() != 'td') {
        return;
      }
      var nTr = this;
      $subtable = $(this).find('table');
      if ($subtable.length) {
        return;
      }
      if (datatable.fnIsOpen(nTr)) {
        datatable.fnClose(nTr);
      }
      else {
        datatable.fnOpen(nTr, fnFormatDetails(nTr), 'details');
      }
    })
    .on('click', 'a.table-event-action', function (e) {
      e.stopPropagation();
      customSearchData.splice(3, Number.MAX_VALUE);
      customSearchData.push({name: 'event', value: $(this).parents('tr').find('td').eq(0).text()});
      customSearchData.push({name: 'action', value: $(this).data('action')});

      $.ajax({
        url: Routing.generate('_main_failedevent_action'),
        type: 'POST',
        dataType: 'json',
        data: customSearchData,
        success: function (json) {
          if (json.flashmessage) {
            flashmessage(json.flashmessage.message, json.flashmessage.class);
          }
          datatable.fnPageChange(0);
        }
      });

      return false;
    });

  $('.datatable-action').on('click', function () {
    customSearchData = [];
    customSearchData.push({name: 'database', value: $('[name^=table-event-]').attr('name').replace('table-event-', '')});
    customSearchData.push({name: 'queue', value: $(this).parents('tr').find('td').eq(0).text()});
    customSearchData.push({name: 'consumer', value: $(this).parents('tr').find('td').eq(1).text()});
    $(this).parents('tbody').find('tr').removeClass('active');
    $(this).parents('tr').addClass('active');
    datatable.fnFilter('');

    return false;
  });

  var refresh = function() {
    datatable.fnDrawCallback();
    setTimeout(refresh, 3000);
  }
});