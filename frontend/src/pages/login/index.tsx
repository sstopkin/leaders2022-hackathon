import React from "react";
import { useLogin, useTranslate } from "@pankod/refine-core";
import {
    Row,
    Col,
    AntdLayout,
    Card,
    Typography,
    Form,
    Input,
    Button,
} from "@pankod/refine-antd";
import "./styles.css";

const { Title } = Typography;

export interface ILoginForm {
    username: string;
    password: string;
    remember: boolean;
}

export const Login: React.FC = () => {
    const [form] = Form.useForm<ILoginForm>();

    const t = useTranslate();

    const { mutate: login } = useLogin<ILoginForm>();

    const CardTitle = (
        <Title level={3} className="title">
            {t("pages.login.title")}
        </Title>
    );

    return (
        <AntdLayout className="layout">
            <Row
                justify="center"
                align="middle"
                style={{
                    height: "100vh",
                }}
            >
                <Col xs={22}>
                    <div className="container">
                        <div className="imageContainer">
                            <img
                                style={{ marginBottom: 0 }}
                                src="/images/logo-dark.png"
                                alt="Logo"
                                width="100%"
                            />
                        </div>
                        <Card title={CardTitle} headStyle={{ borderBottom: 0 }}>
                            <Form<ILoginForm>
                                layout="vertical"
                                form={form}
                                onFinish={(values) => {
                                    login(values);
                                }}
                                requiredMark={false}
                                initialValues={{
                                    remember: false,
                                }}
                            >
                                <Form.Item
                                    name="username"
                                    label={t("pages.login.username")}
                                    rules={[{ required: true }]}
                                >
                                    <Input
                                        size="large"
                                        placeholder={t("pages.login.username")}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="password"
                                    label={t("pages.login.password")}
                                    rules={[{ required: true }]}
                                    style={{ marginBottom: "12px" }}
                                >
                                    <Input
                                        type="password"
                                        placeholder="●●●●●●●●"
                                        size="large"
                                    />
                                </Form.Item>
                                <div style={{ marginBottom: "12px" }}>
                                    {/* <Form.Item
                                        name="remember"
                                        valuePropName="checked"
                                        noStyle
                                    >
                                        <Checkbox
                                            style={{
                                                fontSize: "12px",
                                            }}
                                        >
                                            Remember me
                                        </Checkbox>
                                    </Form.Item> */}

                                    {/* <a
                                        style={{
                                            float: "right",
                                            fontSize: "12px",
                                        }}
                                        href="#"
                                    >
                                        Forgot password?
                                    </a> */}
                                </div>
                                <Button
                                    type="primary"
                                    size="large"
                                    htmlType="submit"
                                    block
                                >
                                    {t("pages.login.signin")}
                                </Button>
                            </Form>
                            {/* <div style={{ marginTop: 8 }}>
                                <Text style={{ fontSize: 12 }}>
                                    Don’t have an account?{" "}
                                    <a href="#" style={{ fontWeight: "bold" }}>
                                        Sign up
                                    </a>
                                </Text>
                            </div> */}
                        </Card>
                    </div>
                </Col>
            </Row>
        </AntdLayout>
    );
};
