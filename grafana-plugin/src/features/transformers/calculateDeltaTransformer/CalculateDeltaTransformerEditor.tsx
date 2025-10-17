import { css } from '@emotion/css';
import { FieldType, GrafanaTheme2, TransformerUIProps } from '@grafana/data';
import { FieldValidationMessage, InlineField, InlineFieldRow, Input, Select, useStyles2 } from '@grafana/ui';
import { uniqBy } from 'lodash';
import React from 'react';

import { GrafanaThemeProvider } from 'datasource/components';

import { fieldToSelectableValue } from 'features/transformers/common';
import { updateCalculateDeltaTransformerOptionsToLatestVersion } from 'features/versioning/calculateDeltaTransformer';

import { CalculateDeltaTransformerOptions } from './CalculateDeltaTransformerOptions';

function getCalculateDeltaTransformerStyles(theme: GrafanaTheme2) {
  const container = css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  });

  return {
    row: container,
  };
}

const inlineFieldLabelWidth = 20;

export function CalculateDeltaTransformerEditor({
  input: frames,
  options: optionsOfUnknownVersion,
  onChange: onOptionsChange,
}: TransformerUIProps<CalculateDeltaTransformerOptions>) {
  const styles = useStyles2(getCalculateDeltaTransformerStyles);
  let options: CalculateDeltaTransformerOptions;
  try {
    options = updateCalculateDeltaTransformerOptionsToLatestVersion(optionsOfUnknownVersion);
  } catch (error) {
    return (
      <FieldValidationMessage>{`Error while converting 'calculate delta' transformation options to latest version: ${
        error instanceof Error ? error.message : error
      }`}</FieldValidationMessage>
    );
  }

  if (!frames.length) {
    return <FieldValidationMessage>There is no data to transform.</FieldValidationMessage>;
  }

  const allHaveTimeField = frames.every((frame) => frame.fields.some((field) => field.type === FieldType.time));

  if (!allHaveTimeField) {
    return (
      <FieldValidationMessage>
        {"Not every frame has a time field, 'calculate delta' transformation is only supported for timeseries"}
      </FieldValidationMessage>
    );
  }

  const numberFields = frames.flatMap(({ fields }) => fields).filter(({ type }) => type === FieldType.number);
  const uniqueNumberFields = uniqBy(numberFields, (field) => field.name);
  const columnSelectableValues = uniqueNumberFields.map(fieldToSelectableValue);

  const selectedFieldBaseDisplayName =
    columnSelectableValues.find((selectableValue) => selectableValue.value === options.sourceColumn)?.label ?? 'column';

  return (
    <GrafanaThemeProvider>
      <div>
        <InlineFieldRow className={styles.row}>
          <InlineField
            label={'Source attribute'}
            labelWidth={inlineFieldLabelWidth}
            grow
            title="Attribute to calculate delta from"
          >
            <Select
              value={options.sourceColumn}
              options={columnSelectableValues}
              onChange={(v) => {
                onOptionsChange({ ...options, sourceColumn: v.value });
              }}
              placeholder={'Select attribute to calculate delta from'}
            />
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow className={styles.row}>
          <InlineField
            label={'Difference field name'}
            labelWidth={inlineFieldLabelWidth}
            grow
            title="Field name for calculated delta column"
          >
            <Input
              value={options.deltaColumnName ?? `Difference of '${selectedFieldBaseDisplayName}'`}
              onChange={(v: React.ChangeEvent<HTMLInputElement>) => {
                onOptionsChange({ ...options, deltaColumnName: v.target.value });
              }}
              placeholder={'Enter field name for delta column'}
            />
          </InlineField>
        </InlineFieldRow>
      </div>
    </GrafanaThemeProvider>
  );
}
