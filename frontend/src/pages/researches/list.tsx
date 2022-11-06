import {
    CrudFilters,
    getDefaultFilter,
    HttpError,
    IResourceComponentsProps, useNavigation,
    usePermissions,
    useTranslate,
} from "@pankod/refine-core";
import {
    List,
    Table,
    TextField,
    useTable,
    useSelect,
    DateField,
    Space,
    DeleteButton,
    ShowButton,
    Button, EditButton, Icons, Col, DatePicker, Form, FormProps, Input, Row, Select, Card,
} from "@pankod/refine-antd";
import {IResearch, IResearchFilterVariables} from "interfaces";
import {Roles} from "interfaces/roles";
import {DATE_FORMAT} from "../../constants";
import { ResearchProcessingStatus } from "components/researchesStatus";
import { useMemo } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import ruLocale from "antd/es/date-picker/locale/ru_RU"
import enLocale from "antd/es/date-picker/locale/en_US";


export const ResearchesList: React.FC<IResourceComponentsProps> = () => {
    const navigate = useNavigation();
    const t = useTranslate();

    const { tableProps, searchFormProps, filters } = useTable<IResearch,
    HttpError,
    IResearchFilterVariables>({
        initialSorter: [
            {
                field: "id",
                order: "desc",
            },
        ],
        onSearch: (params) => {
          const filters: CrudFilters = [];
          const { name, createdAt, status } = params;

          filters.push({
            field: "name",
            operator: "contains",
            value: name ? name : undefined,
          });

          filters.push({
            field: "status",
            operator: "eq",
            value:
            status && status.length > 0
                ? status
                : undefined,
          });

          filters.push(
            {
              field: "createdAt",
              operator: "gte",
              value: createdAt
                ? createdAt[0].startOf("day").toISOString()
                : undefined,
            },
            {
              field: "createdAt",
              operator: "lte",
              value: createdAt
                ? createdAt[1].endOf("day").toISOString()
                : undefined,
            }
          );

          return filters;
        },
      });

    const {data: permissionsData} = usePermissions();

    return (
        <Row gutter={[16, 16]}>
        <Col xl={5} lg={24} xs={24}>
          <Card bordered={false} title={t("researches.filter.title")}>
            <Filter formProps={searchFormProps} filters={filters || []} />
          </Card>
        </Col>
        <Col xl={19} xs={24}>
        <List headerButtons={({defaultButtons}) => <><Button
            onClick={() => navigate.push("/researches/generate")}
            type="default"
            icon={
                <Icons.PlusSquareOutlined />}>
            Сгенерировать
        </Button>{defaultButtons}</>}>
            <Table {...tableProps} rowKey="id">
                <Table.Column
                    dataIndex="name"
                    key="name"
                    title={t("researches.fields.name")}
                    render={(value) => <TextField value={value}/>}
                    sorter
                />
                <Table.Column
                    dataIndex="status"
                    key="status"
                    title={t("researches.fields.status")}
                    render={(value) => {
                        return <ResearchProcessingStatus status={value} />;
                    }}
                    sorter
                />
                <Table.Column
                    dataIndex="parentResearchId"
                    title={t("researches.fields.researchType")}
                    render={(value) => (value) ? <TextField value={"Сгенерированное"}/> : <TextField value={t("Исходное")}/>}
                />
                <Table.Column
                    dataIndex="createdAt"
                    key="createdAt"
                    title={t("researches.fields.createdAt")}
                    render={(value) => (value) ? <DateField value={(value) ? value : ''} format={DATE_FORMAT}/> : '-'}
                    sorter
                />
                <Table.Column
                    dataIndex="updatedAt"
                    key="updatedAt"
                    title={t("researches.fields.updatedAt")}
                    render={(value) => (value) ? <DateField value={(value) ? value : ''} format={DATE_FORMAT}/> : '-'}
                    sorter
                />
                <Table.Column<IResearch>
                    title={t("table.actions")}
                    dataIndex="actions"
                    render={(_, record) => (
                        <Space>
                            <ShowButton hideText size="small" recordItemId={record.id}/>
                              <EditButton
                                hideText
                                size="small"
                                recordItemId={record.id}
                              />
                            {permissionsData?.includes(Roles.ADMIN) && (
                                <DeleteButton hideText size="small" recordItemId={record.id}/>
                            )}
                        </Space>
                    )}
                />
            </Table>
        </List>
        </Col>
    </Row>
  );
};

const Filter: React.FC<{ formProps: FormProps; filters: CrudFilters }> = (
    props
  ) => {
    const {i18n, t} = useTranslation();

    const { formProps, filters } = props;
    const { selectProps: researchesSelectProps } = useSelect<IResearch>({
      resource: "researches",
      defaultValue: getDefaultFilter("research.id", filters),
    });

    const { RangePicker } = DatePicker;

    const dateLocale = useMemo(() => {
      switch (i18n.language) {
          case "ru": {
              return ruLocale
          }
          default: {
              return enLocale
          }
      }
  }, [i18n.language])

    const created_date = useMemo(() => {
      const start = getDefaultFilter("createdAt", filters, "gte");
      const end = getDefaultFilter("createdAt", filters, "lte");

      const startFrom = dayjs(start);
      const endAt = dayjs(end);

      if (start && end) {
        return [startFrom, endAt];
      }
      return undefined;
    }, [filters]);

    return (
      <Form
        layout="vertical"
        {...formProps}
        initialValues={{
          name: getDefaultFilter("name", filters, "in"),
          processingStatus: getDefaultFilter("status.text", filters, "or"),
          created_date,
        }}
      >
        <Row gutter={[10, 0]} align="bottom">
          <Col xl={24} md={8} sm={12} xs={24}>
            <Form.Item label={t("researches.filter.search.label")} name="name">
              <Input
                placeholder={t("researches.filter.search.placeholder")}
                prefix={<Icons.SearchOutlined />}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col xl={24} md={8} sm={12} xs={24}>
            <Form.Item
              label={t("researches.filter.status.label")}
              name="status"
            >
              <Select
                options={[
                  {
                    label: "Создано",
                    value: "created",
                  },
                  {
                    label: "Готов к разметке",
                    value: "ready_to_mark",
                  },
                  {
                    label: "В работе",
                    value: "in_markup",
                  },
                  {
                    label: "Размечен",
                    value: "markup_done",
                  },
                  {
                    label: "Ошибка",
                    value: "error",
                  }
                ]}
                allowClear
                mode="tags"
                placeholder={t("researches.filter.status.placeholder")}
              />
            </Form.Item>
          </Col>
          <Col xl={24} md={8} sm={12} xs={24}>
            <Form.Item label={t("researches.filter.createdAt")} name="createdAt">
              <RangePicker locale={dateLocale} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xl={24} md={8} sm={12} xs={24}>
            <Form.Item>
              <Button htmlType="submit" type="primary" size="large" block>
                {t("researches.filter.submit")}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  };
  
