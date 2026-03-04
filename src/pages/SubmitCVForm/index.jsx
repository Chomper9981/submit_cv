import React, { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Upload,
  Divider,
  Typography,
  Row,
  Col,
  Avatar,
  Card,
  Slider,
  Popconfirm,
} from "antd";
import {
  UserOutlined,
  UploadOutlined,
  FileTextOutlined,
  CalendarOutlined,
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "../../styles/SubmitCVForm.css";

const { Title, Text } = Typography;
const { TextArea } = Input;

const SubmitCVForm = ({ onSubmit }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    const storedData = localStorage.getItem("cv_data");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData.dateOfBirth) {
          parsedData.dateOfBirth = dayjs(parsedData.dateOfBirth);
        }
        form.setFieldsValue(parsedData);
      } catch (e) {
        console.error("Error parsing stored CV data", e);
      }
    }
  }, [form]);

  const handleResetCV = () => {
    localStorage.removeItem("cv_data");
    form.resetFields();
  };

  const onFinish = (values) => {
    localStorage.setItem("cv_data", JSON.stringify(values));
    if (onSubmit) {
      onSubmit(values);
    } else {
      window.location.href = "/preview";
    }
  };

  return (
    <div className="submit-cv-container">
      <div className="submit-cv-wrapper">
        <Card className="submit-cv-card">
          <div className="submit-cv-header">
            <FileTextOutlined className="submit-cv-icon" />
            <Title level={2} className="submit-cv-title">
              Tạo CV của bạn
            </Title>
            <Text className="submit-cv-subtitle">
              Điền đầy đủ thông tin để tạo CV chuyên nghiệp
            </Text>
            <div style={{ marginTop: "16px" }}>
              <Popconfirm
                title="Làm mới CV"
                description="Bạn có chắc chắn muốn xóa toàn bộ dữ liệu đã nhập?"
                onConfirm={handleResetCV}
                okText="Đồng ý"
                cancelText="Hủy"
              >
                <Button danger icon={<ReloadOutlined />}>
                  Làm mới CV
                </Button>
              </Popconfirm>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              workExperiences: [{}],
              education: [{}],
              skills: [{}],
              certificates: [{}],
              references: [{}],
              projects: [{}],
            }}
          >
            {/* Ảnh đại diện */}
            <Divider titlePlacement="left" className="submit-cv-divider">
              <span className="submit-cv-divider-text">📷 Ảnh đại diện</span>
            </Divider>
            <div className="submit-cv-avatar-container">
              <Avatar
                size={100}
                icon={<UserOutlined />}
                className="submit-cv-avatar"
              />
              <br />
              <Form.Item
                name="avatar"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                className="submit-cv-upload-item"
              >
                <Upload
                  beforeUpload={() => false}
                  maxCount={1}
                  accept=".jpg,.jpeg,.png"
                >
                  <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                </Upload>
              </Form.Item>
            </div>

            {/* Thông tin cá nhân */}
            <Divider titlePlacement="left" className="submit-cv-divider">
              <span className="submit-cv-divider-text">
                👤 Thông tin cá nhân
              </span>
            </Divider>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Họ và tên"
                  name="fullName"
                  rules={[
                    { required: true, message: "Vui lòng nhập họ và tên!" },
                  ]}
                >
                  <Input size="large" placeholder="Đinh Xuân Thảo" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Vị trí ứng tuyển"
                  name="jobTitle"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập vị trí ứng tuyển!",
                    },
                  ]}
                >
                  <Input size="large" placeholder="Product Manager" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="Ngày sinh"
                  name="dateOfBirth"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày sinh!" },
                  ]}
                >
                  <DatePicker
                    size="large"
                    format="DD/MM/YYYY"
                    className="submit-cv-date-picker"
                    placeholder="Chọn ngày"
                    suffixIcon={<CalendarOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={16}>
                <Form.Item
                  label="Địa chỉ"
                  name="address"
                  rules={[
                    { required: true, message: "Vui lòng nhập địa chỉ!" },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Nguyễn Đình Chiểu, Phường 5, Quận 3"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại!" },
                  ]}
                >
                  <Input size="large" placeholder="0901234567" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    {
                      required: true,
                      type: "email",
                      message: "Vui lòng nhập email hợp lệ!",
                    },
                  ]}
                >
                  <Input size="large" placeholder="email@example.com" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item label="Facebook" name="facebook">
                  <Input size="large" placeholder="facebook.com/yourname" />
                </Form.Item>
              </Col>
            </Row>

            {/* Giới thiệu */}
            <Divider titlePlacement="left" className="submit-cv-divider">
              <span className="submit-cv-divider-text">📝 Giới thiệu</span>
            </Divider>
            <Form.Item
              label="Giới thiệu bản thân"
              name="introduction"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập giới thiệu bản thân!",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Với hơn hai năm kinh nghiệm ở các vị trí Product Manager..."
              />
            </Form.Item>

            {/* Kinh nghiệm làm việc */}
            <Divider titlePlacement="left" className="submit-cv-divider">
              <span className="submit-cv-divider-text">
                💼 Kinh nghiệm làm việc
              </span>
            </Divider>
            <Form.List name="workExperiences">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Card
                      size="small"
                      className="submit-cv-section-card"
                      key={field.key}
                      extra={
                        fields.length > 1 ? (
                          <DeleteOutlined
                            onClick={() => remove(field.name)}
                            className="submit-cv-delete-icon"
                          />
                        ) : null
                      }
                    >
                      <Row gutter={12}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name={[field.name, "position"]}
                            label="Vị trí"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập vị trí!",
                              },
                            ]}
                          >
                            <Input placeholder="Product Manager" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name={[field.name, "company"]}
                            label="Công ty"
                          >
                            <Input placeholder="Tên công ty" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={12}>
                        <Col xs={12}>
                          <Form.Item
                            name={[field.name, "startDate"]}
                            label="Từ"
                          >
                            <Input placeholder="03/2017" />
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item name={[field.name, "endDate"]} label="Đến">
                            <Input placeholder="03/2018" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item
                        name={[field.name, "details"]}
                        label="Chi tiết công việc"
                      >
                        <TextArea
                          rows={3}
                          placeholder="- Cung cấp thông tin, định hướng..."
                        />
                      </Form.Item>
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => add()}
                  >
                    Thêm kinh nghiệm
                  </Button>
                </>
              )}
            </Form.List>

            {/* Học vấn */}
            <Divider titlePlacement="left" className="submit-cv-divider-margin">
              <span className="submit-cv-divider-text">🎓 Học vấn</span>
            </Divider>
            <Form.List name="education">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Card
                      size="small"
                      className="submit-cv-section-card"
                      key={field.key}
                      extra={
                        fields.length > 1 ? (
                          <DeleteOutlined
                            onClick={() => remove(field.name)}
                            className="submit-cv-delete-icon"
                          />
                        ) : null
                      }
                    >
                      <Row gutter={12}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name={[field.name, "degree"]}
                            label="Bằng cấp / Chuyên ngành"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập bằng cấp!",
                              },
                            ]}
                          >
                            <Input placeholder="Thạc sỹ Quản trị Kinh doanh" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name={[field.name, "school"]}
                            label="Trường"
                          >
                            <Input placeholder="Đại học Kinh tế" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={12}>
                        <Col xs={12}>
                          <Form.Item
                            name={[field.name, "startDate"]}
                            label="Từ"
                          >
                            <Input placeholder="01/2016" />
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item name={[field.name, "endDate"]} label="Đến">
                            <Input placeholder="12/2018" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item
                        name={[field.name, "details"]}
                        label="Chi tiết"
                      >
                        <TextArea
                          rows={2}
                          placeholder="Luận án, thành tích nổi bật..."
                        />
                      </Form.Item>
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => add()}
                  >
                    Thêm học vấn
                  </Button>
                </>
              )}
            </Form.List>

            {/* Kỹ năng */}
            <Divider titlePlacement="left" className="submit-cv-divider-margin">
              <span className="submit-cv-divider-text">💻 Kỹ năng</span>
            </Divider>
            <Form.List name="skills">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Row
                      gutter={12}
                      align="middle"
                      className="submit-cv-skill-row"
                      key={field.key}
                    >
                      <Col xs={10} sm={8}>
                        <Form.Item name={[field.name, "name"]} noStyle>
                          <Input placeholder="Tiếng Anh" />
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={14}>
                        <Form.Item
                          name={[field.name, "level"]}
                          noStyle
                          initialValue={50}
                        >
                          <Slider />
                        </Form.Item>
                      </Col>
                      <Col xs={2}>
                        {fields.length > 1 ? (
                          <DeleteOutlined
                            onClick={() => remove(field.name)}
                            className="submit-cv-delete-icon-padding"
                          />
                        ) : null}
                      </Col>
                    </Row>
                  ))}
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => add()}
                    className="submit-cv-add-btn-margin"
                  >
                    Thêm kỹ năng
                  </Button>
                </>
              )}
            </Form.List>

            {/* Chứng chỉ */}
            <Divider titlePlacement="left" className="submit-cv-divider-margin">
              <span className="submit-cv-divider-text">📜 Chứng chỉ</span>
            </Divider>
            <Form.List name="certificates">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Card
                      size="small"
                      className="submit-cv-section-card"
                      key={field.key}
                      extra={
                        fields.length > 1 ? (
                          <DeleteOutlined
                            onClick={() => remove(field.name)}
                            className="submit-cv-delete-icon"
                          />
                        ) : null
                      }
                    >
                      <Row gutter={12}>
                        <Col xs={16}>
                          <Form.Item
                            name={[field.name, "name"]}
                            label="Tên chứng chỉ"
                          >
                            <Input placeholder="TOEIC 850" />
                          </Form.Item>
                        </Col>
                        <Col xs={8}>
                          <Form.Item
                            name={[field.name, "date"]}
                            label="Thời gian"
                          >
                            <Input placeholder="12/2022" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item
                        name={[field.name, "details"]}
                        label="Chi tiết"
                      >
                        <TextArea
                          rows={2}
                          placeholder="Chi tiết chứng chỉ..."
                        />
                      </Form.Item>
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => add()}
                  >
                    Thêm chứng chỉ
                  </Button>
                </>
              )}
            </Form.List>

            {/* Ngôn ngữ */}
            <Divider titlePlacement="left" className="submit-cv-divider-margin">
              <span className="submit-cv-divider-text">🌐 Ngôn ngữ</span>
            </Divider>
            <Form.Item
              name="languages"
              label="Ngôn ngữ (cách nhau bằng dấu phẩy)"
            >
              <Input
                size="large"
                placeholder="Tiếng Việt, Tiếng Anh, Tiếng Nhật"
              />
            </Form.Item>

            {/* Giải thưởng */}
            <Divider titlePlacement="left" className="submit-cv-divider-margin">
              <span className="submit-cv-divider-text">🏆 Giải thưởng</span>
            </Divider>
            <Form.Item name="awards" label="Giải thưởng">
              <TextArea rows={2} placeholder="Giải nhất cuộc thi..." />
            </Form.Item>

            {/* Điều quan tâm */}
            <Divider titlePlacement="left" className="submit-cv-divider-margin">
              <span className="submit-cv-divider-text">❤️ Điều quan tâm</span>
            </Divider>
            <Form.Item name="interests" label="Sở thích / Điều quan tâm">
              <TextArea rows={2} placeholder="Đọc sách, du lịch..." />
            </Form.Item>

            {/* Hoạt động */}
            <Divider titlePlacement="left" className="submit-cv-divider-margin">
              <span className="submit-cv-divider-text">🎯 Hoạt động</span>
            </Divider>
            <Form.Item name="activities" label="Hoạt động ngoại khóa">
              <TextArea rows={2} placeholder="Tình nguyện viên..." />
            </Form.Item>

            {/* Người tham chiếu */}
            <Divider titlePlacement="left" className="submit-cv-divider-margin">
              <span className="submit-cv-divider-text">
                👥 Người tham chiếu
              </span>
            </Divider>
            <Form.List name="references">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Card
                      size="small"
                      className="submit-cv-section-card"
                      key={field.key}
                      extra={
                        fields.length > 1 ? (
                          <DeleteOutlined
                            onClick={() => remove(field.name)}
                            className="submit-cv-delete-icon"
                          />
                        ) : null
                      }
                    >
                      <Row gutter={12}>
                        <Col xs={24} sm={12}>
                          <Form.Item name={[field.name, "name"]} label="Họ tên">
                            <Input placeholder="Nguyễn Văn A" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name={[field.name, "position"]}
                            label="Chức vụ"
                          >
                            <Input placeholder="CTO - Công ty ABC" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={12}>
                        <Col xs={12}>
                          <Form.Item
                            name={[field.name, "phone"]}
                            label="Điện thoại"
                          >
                            <Input placeholder="0901234567" />
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item name={[field.name, "email"]} label="Email">
                            <Input placeholder="email@company.com" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => add()}
                  >
                    Thêm người tham chiếu
                  </Button>
                </>
              )}
            </Form.List>

            {/* Dự án */}
            <Divider titlePlacement="left" className="submit-cv-divider-margin">
              <span className="submit-cv-divider-text">🚀 Dự án</span>
            </Divider>
            <Form.List name="projects">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Card
                      size="small"
                      className="submit-cv-project-card"
                      key={field.key}
                      extra={
                        fields.length > 1 ? (
                          <DeleteOutlined
                            onClick={() => remove(field.name)}
                            className="submit-cv-delete-icon"
                          />
                        ) : null
                      }
                    >
                      <Row gutter={12}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name={[field.name, "name"]}
                            label="Tên dự án"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập tên dự án!",
                              },
                            ]}
                          >
                            <Input placeholder="Hệ thống quản lý bán hàng" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name={[field.name, "role"]}
                            label="Vai trò"
                          >
                            <Input placeholder="Team Leader / Developer" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={12}>
                        <Col xs={12}>
                          <Form.Item
                            name={[field.name, "startDate"]}
                            label="Từ"
                          >
                            <Input placeholder="01/2023" />
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item name={[field.name, "endDate"]} label="Đến">
                            <Input placeholder="06/2023" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item
                        name={[field.name, "technologies"]}
                        label="Công nghệ sử dụng"
                      >
                        <Input placeholder="React, Node.js, PostgreSQL..." />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, "description"]}
                        label="Mô tả dự án"
                      >
                        <TextArea
                          rows={3}
                          placeholder="Mô tả chi tiết về dự án, chức năng chính, kết quả đạt được..."
                        />
                      </Form.Item>
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => add()}
                  >
                    Thêm dự án
                  </Button>
                </>
              )}
            </Form.List>

            {/* Submit */}
            <Form.Item className="submit-cv-submit-container">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="submit-cv-submit-btn"
              >
                Xem trước CV
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default SubmitCVForm;
