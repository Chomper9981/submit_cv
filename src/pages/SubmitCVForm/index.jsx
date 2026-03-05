import React, { useEffect, useMemo } from "react";
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
  message,
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
    const storedAvatar = localStorage.getItem("cv_avatar");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData.dateOfBirth) {
          parsedData.dateOfBirth = dayjs(parsedData.dateOfBirth);
        }
        ["workExperiences", "education", "projects"].forEach((key) => {
          if (Array.isArray(parsedData[key])) {
            parsedData[key] = parsedData[key].map((item) => ({
              ...item,
              startDate: item.startDate ? dayjs(item.startDate) : undefined,
              endDate: item.endDate ? dayjs(item.endDate) : undefined,
            }));
          }
        });
        if (Array.isArray(parsedData.certificates)) {
          parsedData.certificates = parsedData.certificates.map((item) => ({
            ...item,
            date: item.date ? dayjs(item.date) : undefined,
          }));
        }
        if (storedAvatar) {
          parsedData.avatar = [
            {
              uid: "-1",
              name: "avatar.png",
              status: "done",
              url: storedAvatar,
            },
          ];
        }
        form.setFieldsValue(parsedData);
      } catch (e) {
        console.error("Error parsing stored CV data", e);
      }
    }
  }, [form]);

  const handleResetCV = () => {
    localStorage.removeItem("cv_data");
    localStorage.removeItem("cv_avatar");
    form.resetFields();
  };

  // Hàm chuyển đổi hình ảnh tải lên thành mã ký tự (Base 64 Encode)
  // Đặc biệt: Hàm này chèn thẻ <canvas> để có thể làm hẹp kích thước của ảnh xuống đúng khung 300x300.
  // Qua đó ép size ảnh từ Megabytes xuống mức ~ vài Kilobytes, lách hạn mức dung lượng cấm (5M) của Trình duyệt.
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (error) => reject(error);
    });

  const onFinish = async (values) => {
    // Tách riêng file ảnh ra, vì các tệp tin object File từ thẻ Upload
    // không thể lưu được vào chuỗi JSON bằng phương pháp thông thường.
    const { avatar, ...cvDataWithoutAvatar } = values;
    localStorage.setItem("cv_data", JSON.stringify(cvDataWithoutAvatar));

    if (avatar && avatar.length > 0 && avatar[0].originFileObj) {
      try {
        const base64 = await getBase64(avatar[0].originFileObj);
        localStorage.setItem("cv_avatar", base64);
      } catch (err) {
        console.error("Error converting avatar to Base64", err);
      }
    } else if (!avatar || avatar.length === 0) {
      localStorage.removeItem("cv_avatar");
    } else if (avatar && avatar.length > 0 && avatar[0].url) {
      localStorage.setItem("cv_avatar", avatar[0].url);
    }

    if (onSubmit) {
      onSubmit(values);
    } else {
      window.location.href = "/preview";
    }
  };

  // Focus và cuộn giao diện đến field bị dính lỗi validate đầu tiên khi người dùng bấm Submit
  const onFinishFailed = (errorInfo) => {
    const errorField = errorInfo.errorFields[0];
    if (errorField) {
      form.scrollToField(errorField.name, {
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const avatarFile = Form.useWatch("avatar", form);

  // Tạo Preview (Xem trước ảnh tạm bằng Memoization - UseMemo)
  const avatarPreview = useMemo(() => {
    if (avatarFile && avatarFile.length > 0) {
      const fileEntry = avatarFile[0];
      if (fileEntry.url) {
        return fileEntry.url;
      }
      if (fileEntry.originFileObj) {
        return URL.createObjectURL(fileEntry.originFileObj);
      }
    }
    return null;
  }, [avatarFile]);

  // Rất quan trọng: Xóa rác và giải phóng bộ nhớ ảo (memory leaks)
  // Tính năng ObjectURL tạo các liên kết giả lập, khi component bị bỏ đi mình cần thông báo dọn dẹp biến tạm thời.
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

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
            onFinishFailed={onFinishFailed}
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
                icon={!avatarPreview && <UserOutlined />}
                src={avatarPreview}
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
                  beforeUpload={(file) => {
                    const isImage =
                      file.type === "image/jpeg" ||
                      file.type === "image/png" ||
                      file.type === "image/webp";
                    if (!isImage) {
                      message.error(
                        "Bạn chỉ có thể chọn tệp hình ảnh (JPG, PNG, WEBP)!",
                      );
                      return Upload.LIST_IGNORE;
                    }
                    return false;
                  }}
                  maxCount={1}
                  accept=".jpg,.jpeg,.png,.webp"
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
                    {
                      required: true,
                      message: "Vui lòng nhập họ và tên!",
                      whitespace: true,
                    },
                    {
                      pattern: /^[\p{L}\s]+$/u,
                      message: "Họ và tên không được chứa kí tự đặc biệt!",
                    },
                  ]}
                >
                  <Input size="large" placeholder="Nhập họ và tên" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Vị trí ứng tuyển"
                  name="jobTitle"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      message: "Vui lòng nhập vị trí ứng tuyển!",
                    },
                    {
                      pattern: /^["\p{L}\s]+$/u,
                      message:
                        "Vị trí ứng tuyển không được chứa kí tự đặc biệt!",
                    },
                  ]}
                >
                  <Input size="large" placeholder="Nhập vị trí ứng tuyển" />
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
                    {
                      required: true,
                      message: "Vui lòng nhập địa chỉ!",
                      whitespace: true,
                    },
                  ]}
                >
                  <Input size="large" placeholder="Nhập địa chỉ" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập số điện thoại!",
                      whitespace: true,
                    },
                    {
                      pattern: /^[0-9]{10}$/,
                      message: "Số điện thoại phải có 10 chữ số!",
                    },
                  ]}
                >
                  <Input size="large" placeholder="Nhập số điện thoại" />
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
                      whitespace: true,
                    },
                  ]}
                >
                  <Input size="large" placeholder="email@example.com" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="Địa chỉ mạng xã hội"
                  name="social"
                  rules={[
                    {
                      whitespace: true,
                      message: "Vui lòng nhập nội dung hợp lệ!",
                    },
                  ]}
                >
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
                  whitespace: true,
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Giới thiệu về bản thân ngắn gọn, tổng quát"
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
                                whitespace: true,
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
                            rules={[
                              {
                                whitespace: true,
                                message: "Vui lòng nhập nội dung hợp lệ!",
                              },
                            ]}
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
                            <DatePicker
                              picker="month"
                              format="MM/YYYY"
                              placeholder="Chọn tháng/năm"
                              className="submit-cv-date-picker"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item name={[field.name, "endDate"]} label="Đến">
                            <DatePicker
                              picker="month"
                              format="MM/YYYY"
                              placeholder="Chọn tháng/năm"
                              className="submit-cv-date-picker"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item
                        name={[field.name, "details"]}
                        label="Chi tiết công việc"
                        rules={[
                          {
                            whitespace: true,
                            message: "Vui lòng nhập nội dung hợp lệ!",
                          },
                        ]}
                      >
                        <TextArea
                          rows={3}
                          placeholder="- Cung cấp thông tin chi tiết..."
                        />
                      </Form.Item>
                    </Card>
                  ))}
                  <Form.Item shouldUpdate>
                    {() => {
                      const values =
                        form.getFieldValue("workExperiences") || [];
                      const isComplete = values.every(
                        (item) =>
                          item?.position?.trim() &&
                          item?.company?.trim() &&
                          item?.startDate &&
                          item?.endDate &&
                          item?.details?.trim(),
                      );
                      return (
                        <Button
                          type="dashed"
                          block
                          icon={<PlusOutlined />}
                          onClick={() => add()}
                          disabled={!isComplete}
                        >
                          Thêm kinh nghiệm
                        </Button>
                      );
                    }}
                  </Form.Item>
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
                                whitespace: true,
                              },
                            ]}
                          >
                            <Input placeholder="Nhập bằng cấp / chuyên ngành" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name={[field.name, "school"]}
                            label="Trường"
                            rules={[
                              {
                                whitespace: true,
                                message: "Vui lòng nhập nội dung hợp lệ!",
                              },
                            ]}
                          >
                            <Input placeholder="Nhập tên trường" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={12}>
                        <Col xs={12}>
                          <Form.Item
                            name={[field.name, "startDate"]}
                            label="Từ"
                          >
                            <DatePicker
                              picker="month"
                              format="MM/YYYY"
                              placeholder="Chọn tháng/năm"
                              className="submit-cv-date-picker"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item name={[field.name, "endDate"]} label="Đến">
                            <DatePicker
                              picker="month"
                              format="MM/YYYY"
                              placeholder="Chọn tháng/năm"
                              className="submit-cv-date-picker"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item
                        name={[field.name, "details"]}
                        label="Chi tiết"
                        rules={[
                          {
                            whitespace: true,
                            message: "Vui lòng nhập nội dung hợp lệ!",
                          },
                        ]}
                      >
                        <TextArea
                          rows={2}
                          placeholder="Luận án, thành tích nổi bật..."
                        />
                      </Form.Item>
                    </Card>
                  ))}
                  <Form.Item shouldUpdate>
                    {() => {
                      const values = form.getFieldValue("education") || [];
                      const isComplete = values.every(
                        (item) =>
                          item?.degree?.trim() &&
                          item?.school?.trim() &&
                          item?.startDate &&
                          item?.endDate &&
                          item?.details?.trim(),
                      );
                      return (
                        <Button
                          type="dashed"
                          block
                          icon={<PlusOutlined />}
                          onClick={() => add()}
                          disabled={!isComplete}
                        >
                          Thêm học vấn
                        </Button>
                      );
                    }}
                  </Form.Item>
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
                        <Form.Item
                          name={[field.name, "name"]}
                          noStyle
                          rules={[
                            {
                              whitespace: true,
                              message: "Vui lòng nhập nội dung hợp lệ!",
                            },
                          ]}
                        >
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
                  <Form.Item shouldUpdate>
                    {() => {
                      const values = form.getFieldValue("skills") || [];
                      const isComplete = values.every(
                        (item) =>
                          item?.name?.trim() && item?.level !== undefined,
                      );
                      return (
                        <Button
                          type="dashed"
                          block
                          icon={<PlusOutlined />}
                          onClick={() => add()}
                          disabled={!isComplete}
                          className="submit-cv-add-btn-margin"
                        >
                          Thêm kỹ năng
                        </Button>
                      );
                    }}
                  </Form.Item>
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
                            rules={[
                              {
                                whitespace: true,
                                message: "Vui lòng nhập nội dung hợp lệ!",
                              },
                            ]}
                          >
                            <Input placeholder="TOEIC 850" />
                          </Form.Item>
                        </Col>
                        <Col xs={8}>
                          <Form.Item
                            name={[field.name, "date"]}
                            label="Thời gian"
                          >
                            <DatePicker
                              picker="month"
                              format="MM/YYYY"
                              placeholder="Chọn tháng/năm"
                              className="submit-cv-date-picker"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item
                        name={[field.name, "details"]}
                        label="Chi tiết"
                        rules={[
                          {
                            whitespace: true,
                            message: "Vui lòng nhập nội dung hợp lệ!",
                          },
                        ]}
                      >
                        <TextArea
                          rows={2}
                          placeholder="Chi tiết chứng chỉ..."
                        />
                      </Form.Item>
                    </Card>
                  ))}
                  <Form.Item shouldUpdate>
                    {() => {
                      const values = form.getFieldValue("certificates") || [];
                      const isComplete = values.every(
                        (item) =>
                          item?.name?.trim() &&
                          item?.date &&
                          item?.details?.trim(),
                      );
                      return (
                        <Button
                          type="dashed"
                          block
                          icon={<PlusOutlined />}
                          onClick={() => add()}
                          disabled={!isComplete}
                        >
                          Thêm chứng chỉ
                        </Button>
                      );
                    }}
                  </Form.Item>
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
              rules={[
                { whitespace: true, message: "Vui lòng nhập nội dung hợp lệ!" },
              ]}
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
            <Form.Item
              name="awards"
              label="Giải thưởng"
              rules={[
                { whitespace: true, message: "Vui lòng nhập nội dung hợp lệ!" },
              ]}
            >
              <TextArea rows={2} placeholder="Giải nhất cuộc thi..." />
            </Form.Item>

            {/* Điều quan tâm */}
            <Divider titlePlacement="left" className="submit-cv-divider-margin">
              <span className="submit-cv-divider-text">❤️ Điều quan tâm</span>
            </Divider>
            <Form.Item
              name="interests"
              label="Sở thích / Điều quan tâm"
              rules={[
                { whitespace: true, message: "Vui lòng nhập nội dung hợp lệ!" },
              ]}
            >
              <TextArea rows={2} placeholder="Đọc sách, du lịch..." />
            </Form.Item>

            {/* Hoạt động */}
            <Divider titlePlacement="left" className="submit-cv-divider-margin">
              <span className="submit-cv-divider-text">🎯 Hoạt động</span>
            </Divider>
            <Form.Item
              name="activities"
              label="Hoạt động ngoại khóa"
              rules={[
                { whitespace: true, message: "Vui lòng nhập nội dung hợp lệ!" },
              ]}
            >
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
                          <Form.Item
                            name={[field.name, "name"]}
                            label="Họ tên"
                            rules={[
                              {
                                whitespace: true,
                                message: "Vui lòng nhập nội dung hợp lệ!",
                              },
                            ]}
                          >
                            <Input placeholder="Nguyễn Văn A" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name={[field.name, "position"]}
                            label="Chức vụ"
                            rules={[
                              {
                                whitespace: true,
                                message: "Vui lòng nhập nội dung hợp lệ!",
                              },
                            ]}
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
                            rules={[
                              {
                                whitespace: true,
                                message: "Vui lòng nhập nội dung hợp lệ!",
                              },
                            ]}
                          >
                            <Input placeholder="Nhập số điện thoại" />
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item
                            name={[field.name, "email"]}
                            label="Email"
                            rules={[
                              {
                                whitespace: true,
                                message: "Vui lòng nhập nội dung hợp lệ!",
                              },
                            ]}
                          >
                            <Input placeholder="email@company.com" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Form.Item shouldUpdate>
                    {() => {
                      const values = form.getFieldValue("references") || [];
                      const isComplete = values.every(
                        (item) =>
                          item?.name?.trim() &&
                          item?.position?.trim() &&
                          item?.phone?.trim() &&
                          item?.email?.trim(),
                      );
                      return (
                        <Button
                          type="dashed"
                          block
                          icon={<PlusOutlined />}
                          onClick={() => add()}
                          disabled={!isComplete}
                        >
                          Thêm người tham chiếu
                        </Button>
                      );
                    }}
                  </Form.Item>
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
                                whitespace: true,
                              },
                            ]}
                          >
                            <Input placeholder="Nhập tên dự án" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name={[field.name, "role"]}
                            label="Vai trò"
                            rules={[
                              {
                                whitespace: true,
                                message: "Vui lòng nhập nội dung hợp lệ!",
                              },
                            ]}
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
                            <DatePicker
                              picker="month"
                              format="MM/YYYY"
                              placeholder="Chọn tháng/năm"
                              className="submit-cv-date-picker"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={12}>
                          <Form.Item name={[field.name, "endDate"]} label="Đến">
                            <DatePicker
                              picker="month"
                              format="MM/YYYY"
                              placeholder="Chọn tháng/năm"
                              className="submit-cv-date-picker"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item
                        name={[field.name, "technologies"]}
                        label="Công nghệ sử dụng"
                        rules={[
                          {
                            whitespace: true,
                            message: "Vui lòng nhập nội dung hợp lệ!",
                          },
                        ]}
                      >
                        <Input placeholder="React, Node.js, PostgreSQL..." />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, "description"]}
                        label="Mô tả dự án"
                        rules={[
                          {
                            whitespace: true,
                            message: "Vui lòng nhập nội dung hợp lệ!",
                          },
                        ]}
                      >
                        <TextArea
                          rows={3}
                          placeholder="Mô tả chi tiết về dự án, chức năng chính, kết quả đạt được..."
                        />
                      </Form.Item>
                    </Card>
                  ))}
                  <Form.Item shouldUpdate>
                    {() => {
                      const values = form.getFieldValue("projects") || [];
                      const isComplete = values.every(
                        (item) =>
                          item?.name?.trim() &&
                          item?.role?.trim() &&
                          item?.startDate &&
                          item?.endDate &&
                          item?.technologies?.trim() &&
                          item?.description?.trim(),
                      );
                      return (
                        <Button
                          type="dashed"
                          block
                          icon={<PlusOutlined />}
                          onClick={() => add()}
                          disabled={!isComplete}
                        >
                          Thêm dự án
                        </Button>
                      );
                    }}
                  </Form.Item>
                </>
              )}
            </Form.List>

            {/* Submit */}
            <div className="submit-cv-submit-wrapper submit-cv-submit-container">
              <Form.Item
                name="attachedCVFile"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                className="submit-cv-submit-item"
              >
                <Upload
                  beforeUpload={(file) => {
                    const isValid =
                      file.type === "application/pdf" ||
                      file.type === "application/msword" ||
                      file.type ===
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                    if (!isValid) {
                      message.error(
                        "Bạn chỉ có thể chọn tệp PDF hoặc Word (DOC/DOCX)!",
                      );
                      return Upload.LIST_IGNORE;
                    }
                    return false;
                  }}
                  maxCount={1}
                  accept=".pdf,.doc,.docx"
                >
                  <Button
                    size="large"
                    icon={<UploadOutlined />}
                    className="submit-cv-upload-btn"
                  >
                    Tải lên CV (PDF/DOCX)
                  </Button>
                </Upload>
              </Form.Item>
              <Form.Item className="submit-cv-submit-item">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="submit-cv-submit-btn"
                >
                  Xem trước CV
                </Button>
              </Form.Item>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default SubmitCVForm;
