/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.fieldUIFieldStorageAddForm = {
    attach: function attach(context) {
      var form = once('field_ui_add', '[data-drupal-selector="field-ui-field-storage-add-form"]', context);

      if (form.length) {
        var $form = $(form);
        $form.find('.js-form-item-label label,' + '.js-form-item-field-name label,' + '.js-form-item-existing-storage-label label').addClass('js-form-required form-required');
        var $newFieldType = $form.find('select[name="new_storage_type"]');
        var $existingStorageName = $form.find('select[name="existing_storage_name"]');
        var $existingStorageLabel = $form.find('input[name="existing_storage_label"]');
        $newFieldType.on('change', function () {
          if ($(this).val() !== '') {
            $existingStorageName.val('').trigger('change');
          }
        });
        $existingStorageName.on('change', function () {
          var value = $(this).val();

          if (value !== '') {
            $newFieldType.val('').trigger('change');

            if (typeof drupalSettings.existingFieldLabels[value] !== 'undefined') {
              $existingStorageLabel.val(drupalSettings.existingFieldLabels[value]);
            }
          }
        });
      }
    }
  };
  Drupal.behaviors.fieldUIDisplayOverview = {
    attach: function attach(context, settings) {
      once('field-display-overview', 'table#field-display-overview', context).forEach(function (overview) {
        Drupal.fieldUIOverview.attach(overview, settings.fieldUIRowsData, Drupal.fieldUIDisplayOverview);
      });
    }
  };
  Drupal.fieldUIOverview = {
    attach: function attach(table, rowsData, rowHandlers) {
      var tableDrag = Drupal.tableDrag[table.id];
      tableDrag.onDrop = this.onDrop;
      tableDrag.row.prototype.onSwap = this.onSwap;
      $(table).find('tr.draggable').each(function () {
        var row = this;

        if (row.id in rowsData) {
          var data = rowsData[row.id];
          data.tableDrag = tableDrag;
          var rowHandler = new rowHandlers[data.rowHandler](row, data);
          $(row).data('fieldUIRowHandler', rowHandler);
        }
      });
    },
    onChange: function onChange() {
      var $trigger = $(this);
      var $row = $trigger.closest('tr');
      var rowHandler = $row.data('fieldUIRowHandler');
      var refreshRows = {};
      refreshRows[rowHandler.name] = $trigger.get(0);
      var region = rowHandler.getRegion();

      if (region !== rowHandler.region) {
        $row.find('select.js-field-parent').val('');
        $.extend(refreshRows, rowHandler.regionChange(region));
        rowHandler.region = region;
      }

      Drupal.fieldUIOverview.AJAXRefreshRows(refreshRows);
    },
    onDrop: function onDrop() {
      var dragObject = this;
      var row = dragObject.rowObject.element;
      var $row = $(row);
      var rowHandler = $row.data('fieldUIRowHandler');

      if (typeof rowHandler !== 'undefined') {
        var regionRow = $row.prevAll('tr.region-message').get(0);
        var region = regionRow.className.replace(/([^ ]+[ ]+)*region-([^ ]+)-message([ ]+[^ ]+)*/, '$2');

        if (region !== rowHandler.region) {
          var refreshRows = rowHandler.regionChange(region);
          rowHandler.region = region;
          Drupal.fieldUIOverview.AJAXRefreshRows(refreshRows);
        }
      }
    },
    onSwap: function onSwap(draggedRow) {
      var rowObject = this;
      $(rowObject.table).find('tr.region-message').each(function () {
        var $this = $(this);

        if ($this.prev('tr').get(0) === rowObject.group[rowObject.group.length - 1]) {
          if (rowObject.method !== 'keyboard' || rowObject.direction === 'down') {
            rowObject.swap('after', this);
          }
        }

        if ($this.next('tr').is(':not(.draggable)') || $this.next('tr').length === 0) {
          $this.removeClass('region-populated').addClass('region-empty');
        } else if ($this.is('.region-empty')) {
          $this.removeClass('region-empty').addClass('region-populated');
        }
      });
    },
    AJAXRefreshRows: function AJAXRefreshRows(rows) {
      var rowNames = [];
      var ajaxElements = [];
      Object.keys(rows || {}).forEach(function (rowName) {
        rowNames.push(rowName);
        ajaxElements.push(rows[rowName]);
      });

      if (rowNames.length) {
        $(ajaxElements).after(Drupal.theme.ajaxProgressThrobber());
        $('input[name=refresh_rows]').val(rowNames.join(' '));
        $('input[data-drupal-selector="edit-refresh"]').trigger('mousedown');
        $(ajaxElements).prop('disabled', true);
      }
    }
  };
  Drupal.fieldUIDisplayOverview = {};

  Drupal.fieldUIDisplayOverview.field = function (row, data) {
    this.row = row;
    this.name = data.name;
    this.region = data.region;
    this.tableDrag = data.tableDrag;
    this.defaultPlugin = data.defaultPlugin;
    this.$pluginSelect = $(row).find('.field-plugin-type');
    this.$pluginSelect.on('change', Drupal.fieldUIOverview.onChange);
    this.$regionSelect = $(row).find('select.field-region');
    this.$regionSelect.on('change', Drupal.fieldUIOverview.onChange);
    return this;
  };

  Drupal.fieldUIDisplayOverview.field.prototype = {
    getRegion: function getRegion() {
      return this.$regionSelect.val();
    },
    regionChange: function regionChange(region) {
      region = region.replace(/-/g, '_');
      this.$regionSelect.val(region);

      if (this.region === 'hidden') {
        var value = typeof this.defaultPlugin !== 'undefined' ? this.defaultPlugin : this.$pluginSelect.find('option').val();

        if (typeof value !== 'undefined') {
          this.$pluginSelect.val(value);
        }
      }

      var refreshRows = {};
      refreshRows[this.name] = this.$pluginSelect.get(0);
      return refreshRows;
    }
  };
})(jQuery, Drupal, drupalSettings);