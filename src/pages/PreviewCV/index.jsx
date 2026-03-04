import React, { useState, useRef } from "react";
import { Typography, Row, Col, Space, Button } from "antd";
import { EditOutlined, FilePdfOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../../styles/PreviewCV.css";

const { Title, Text, Paragraph } = Typography;

const PreviewCV = ({ data }) => {
  const [localData] = useState(() => {
    if (data) return null;
    const storedData = localStorage.getItem("cv_data");
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (e) {
        console.error("Error parsing CV data", e);
      }
    }
    return null;
  });

  const cvData = data || localData;
  const cvRef = useRef(null);

  const handleExportPDF = async () => {
    if (!cvRef.current) return;

    try {
      // Temporarily hide the actions buttons before generating PDF
      const actionsElement = document.querySelector(".preview-cv-actions");
      if (actionsElement) actionsElement.style.display = "none";

      const canvas = await html2canvas(cvRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
      });

      if (actionsElement) actionsElement.style.display = "flex";

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${cvData?.fullName || "CV"}_Resume.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  if (!cvData) {
    return (
      <div className="preview-cv-empty">
        <Title level={3}>Chưa có dữ liệu CV</Title>
        <Text>Vui lòng quay lại trang tạo CV để điền thông tin.</Text>
      </div>
    );
  }

  const {
    fullName = "Nguyễn Văn A",
    jobTitle = "Vị trí ứng tuyển",
    dateOfBirth = "",
    address = "",
    phone = "",
    email = "",
    facebook = "",
    introduction = "",
    workExperiences = [],
    education = [],
    skills = [],
    certificates = [],
    languages = "",
    awards = "",
    interests = "",
    activities = "",
    references = [],
    projects = [],
  } = cvData;

  return (
    <div className="preview-cv-container">
      <div className="preview-cv-wrapper" ref={cvRef}>
        {/* Actions */}
        <div className="preview-cv-actions">
          <Button
            size="large"
            icon={<EditOutlined />}
            className="preview-cv-btn-edit"
            onClick={() => (window.location.href = "/")}
          >
            Chỉnh sửa
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<FilePdfOutlined />}
            className="preview-cv-btn-pdf"
            onClick={handleExportPDF}
          >
            Xuất PDF
          </Button>
        </div>

        <div className="preview-cv-content">
          {/* Left Sidebar */}
          <div className="preview-cv-sidebar">
            {/* Avatar */}
            <div className="preview-cv-avatar-container">
              <div className="preview-cv-avatar-inner">👤</div>
            </div>

            {/* Sidebar Info */}
            <div className="preview-cv-sidebar-info">
              {/* Contact Info */}
              {dateOfBirth && (
                <div className="preview-cv-contact-item">
                  <span className="preview-cv-contact-icon">📅</span>
                  <div>
                    <div className="preview-cv-contact-label">Ngày sinh</div>
                    <div className="preview-cv-contact-value">
                      {dateOfBirth
                        ? dayjs(dateOfBirth).format("DD/MM/YYYY")
                        : "Chưa cập nhật"}
                    </div>
                  </div>
                </div>
              )}

              {address && (
                <div className="preview-cv-contact-item">
                  <span className="preview-cv-contact-icon">📍</span>
                  <div>
                    <div className="preview-cv-contact-label">Địa chỉ</div>
                    <div className="preview-cv-contact-value">{address}</div>
                  </div>
                </div>
              )}

              {phone && (
                <div className="preview-cv-contact-item">
                  <span className="preview-cv-contact-icon">📞</span>
                  <div>
                    <div className="preview-cv-contact-label">SĐT</div>
                    <div className="preview-cv-contact-value">{phone}</div>
                  </div>
                </div>
              )}

              {email && (
                <div className="preview-cv-contact-item">
                  <span className="preview-cv-contact-icon">✉️</span>
                  <div>
                    <div className="preview-cv-contact-label">Email</div>
                    <div className="preview-cv-contact-value">{email}</div>
                  </div>
                </div>
              )}

              {facebook && (
                <div className="preview-cv-contact-item">
                  <span className="preview-cv-contact-icon">🔗</span>
                  <div>
                    <div className="preview-cv-contact-label">Facebook</div>
                    <div className="preview-cv-contact-value">{facebook}</div>
                  </div>
                </div>
              )}

              {/* Skills */}
              {skills && skills.length > 0 && skills[0].name && (
                <>
                  <div className="preview-cv-sidebar-heading">Kỹ năng</div>
                  {skills.map((skill, idx) =>
                    skill.name ? (
                      <div key={idx} className="preview-cv-skill-item">
                        <div className="preview-cv-skill-name">
                          {skill.name}
                        </div>
                        <div className="preview-cv-skill-bar-bg">
                          <div
                            className="preview-cv-skill-bar-fill"
                            style={{ width: `${skill.level || 50}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : null,
                  )}
                </>
              )}

              {/* Languages */}
              {languages && (
                <>
                  <div className="preview-cv-sidebar-heading">Ngôn ngữ</div>
                  {languages.split(",").map((lang, idx) =>
                    lang.trim() ? (
                      <div key={idx} className="preview-cv-list-item">
                        {lang.trim()}
                      </div>
                    ) : null,
                  )}
                </>
              )}

              {/* Interests */}
              {interests && (
                <>
                  <div className="preview-cv-sidebar-heading">Sở thích</div>
                  <div
                    className="preview-cv-list-item"
                    style={{
                      whiteSpace: "pre-wrap",
                      color: "rgb(71, 85, 105)",
                    }}
                  >
                    {interests}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Main Content */}
          <div className="preview-cv-main">
            {/* Header */}
            <div className="preview-cv-header">
              <h1 className="preview-cv-fullname">{fullName}</h1>
              <div className="preview-cv-jobtitle">{jobTitle}</div>
            </div>

            {/* Introduction */}
            {introduction && (
              <div className="preview-cv-section">
                <div className="preview-cv-section-title">Giới thiệu</div>
                <p className="preview-cv-text">{introduction}</p>
              </div>
            )}

            {/* Work Experience */}
            {workExperiences &&
              workExperiences.length > 0 &&
              workExperiences[0].position && (
                <div className="preview-cv-section">
                  <div className="preview-cv-section-title">
                    Kinh nghiệm làm việc
                  </div>
                  {workExperiences.map((exp, idx) =>
                    exp.position ? (
                      <div key={idx} className="preview-cv-timeline-item">
                        <div className="preview-cv-item-title">
                          {exp.position}
                        </div>
                        <div className="preview-cv-item-subtitle">
                          {exp.company}
                        </div>
                        <div className="preview-cv-item-date">
                          {exp.startDate}{" "}
                          {exp.endDate ? `– ${exp.endDate}` : ""}
                        </div>
                        {exp.details && (
                          <p
                            className="preview-cv-text"
                            style={{ marginTop: "8px" }}
                          >
                            {exp.details}
                          </p>
                        )}
                      </div>
                    ) : null,
                  )}
                </div>
              )}

            {/* Education */}
            {education && education.length > 0 && education[0].degree && (
              <div className="preview-cv-section">
                <div className="preview-cv-section-title">Học vấn</div>
                {education.map((edu, idx) =>
                  edu.degree ? (
                    <div key={idx} className="preview-cv-timeline-item">
                      <div className="preview-cv-item-title">{edu.degree}</div>
                      <div className="preview-cv-item-subtitle">
                        {edu.school}
                      </div>
                      <div className="preview-cv-item-date">
                        {edu.startDate} {edu.endDate ? `– ${edu.endDate}` : ""}
                      </div>
                      {edu.details && (
                        <p
                          className="preview-cv-text"
                          style={{ marginTop: "8px" }}
                        >
                          {edu.details}
                        </p>
                      )}
                    </div>
                  ) : null,
                )}
              </div>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && projects[0].name && (
              <div className="preview-cv-section">
                <div className="preview-cv-section-title">Dự án</div>
                {projects.map((proj, idx) =>
                  proj.name ? (
                    <div key={idx} className="preview-cv-box-item">
                      <div className="preview-cv-box-header">
                        <span className="preview-cv-box-title">
                          {proj.name}
                        </span>
                        <span className="preview-cv-box-date">
                          {proj.startDate}{" "}
                          {proj.endDate ? `– ${proj.endDate}` : ""}
                        </span>
                      </div>
                      <div
                        className="preview-cv-item-subtitle"
                        style={{ color: "rgb(71, 85, 105)" }}
                      >
                        Vai trò: {proj.role}
                      </div>
                      {proj.technologies && (
                        <div
                          className="preview-cv-item-date"
                          style={{
                            fontWeight: 500,
                            color: "rgb(100, 116, 139)",
                          }}
                        >
                          Công nghệ: {proj.technologies}
                        </div>
                      )}
                      {proj.description && (
                        <p
                          className="preview-cv-text"
                          style={{ marginTop: "8px" }}
                        >
                          {proj.description}
                        </p>
                      )}
                    </div>
                  ) : null,
                )}
              </div>
            )}

            {/* Certificates */}
            {certificates &&
              certificates.length > 0 &&
              certificates[0].name && (
                <div className="preview-cv-section">
                  <div className="preview-cv-section-title">Chứng chỉ</div>
                  {certificates.map((cert, idx) =>
                    cert.name ? (
                      <div key={idx} className="preview-cv-box-item">
                        <div className="preview-cv-box-header">
                          <span className="preview-cv-box-title">
                            {cert.name}
                          </span>
                          <span className="preview-cv-box-date">
                            {cert.date}
                          </span>
                        </div>
                        {cert.details && (
                          <p
                            className="preview-cv-text"
                            style={{ marginTop: "4px" }}
                          >
                            {cert.details}
                          </p>
                        )}
                      </div>
                    ) : null,
                  )}
                </div>
              )}

            {/* Awards */}
            {awards && (
              <div className="preview-cv-section">
                <div className="preview-cv-section-title">Giải thưởng</div>
                <p
                  className="preview-cv-text"
                  style={{
                    paddingLeft: "16px",
                    borderLeft: "3px solid rgb(226, 232, 240)",
                  }}
                >
                  {awards}
                </p>
              </div>
            )}

            {/* Activities */}
            {activities && (
              <div className="preview-cv-section">
                <div className="preview-cv-section-title">
                  Hoạt động ngoại khóa
                </div>
                <p
                  className="preview-cv-text"
                  style={{
                    paddingLeft: "16px",
                    borderLeft: "3px solid rgb(226, 232, 240)",
                  }}
                >
                  {activities}
                </p>
              </div>
            )}

            {/* References */}
            {references && references.length > 0 && references[0].name && (
              <div className="preview-cv-section">
                <div className="preview-cv-section-title">Người tham chiếu</div>
                <Row gutter={24}>
                  {references.map((ref, idx) =>
                    ref.name ? (
                      <Col span={12} key={idx} className="preview-cv-ref-item">
                        <div className="preview-cv-ref-name">{ref.name}</div>
                        <div className="preview-cv-ref-pos">{ref.position}</div>
                        <div className="preview-cv-ref-contact">
                          📞 {ref.phone}
                        </div>
                        <div className="preview-cv-ref-contact">
                          ✉️ {ref.email}
                        </div>
                      </Col>
                    ) : null,
                  )}
                </Row>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewCV;
