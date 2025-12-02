Kế hoạch Đảm bảo Chất lượng Phần mềm (SQA)
Lịch sử sửa đổi (Revision History)
Số phiên bản
Ngày thay đổi
Mô tả
Người chuẩn bị
Người phê duyệt
v1
01/11/2025

Lâm Tiến Dưỡng
Nguyễn Đức An
Bùi Xuân Đang

1. Giới thiệu (Introduction)
   1.1 Phạm vi

Tài liệu Kế hoạch Đảm bảo Chất lượng Phần mềm được xây dựng để kiểm thử cho dự án hệ thống thương mại điện tử.
Phạm vi của kế hoạch này tập trung vào việc kiểm thử các chức năng cốt lõi của website, đồng thời tiến hành rà soát (review) mã nguồn, tài liệu và testcase của sản phẩm.
Danh mục sản phẩm và tìm kiếm
Kiểm thử việc duyệt danh mục, lọc/sắp xếp sản phẩm, sử dụng thanh tìm kiếm, xem chi tiết sản phẩm và đánh giá người dùng.
Áp dụng: Kiểm thử chức năng (Functional Test) và Kiểm thử tích hợp (Integration Test) để đảm bảo dữ liệu từ backend hiển thị đúng trên giao diện ReactJS.
Rà soát: Review Test Case để đảm bảo bao phủ đủ các trường hợp lọc và tìm kiếm, tránh bỏ sót tình huống biên (ví dụ: tìm sản phẩm không tồn tại).

Thanh toán và đơn hàng
Bao gồm toàn bộ quy trình checkout qua ba phương thức PayPal, Stripe, và COD (sandbox), tạo đơn hàng, lưu dữ liệu, cập nhật tồn kho, và xử lý hoàn tiền.
Áp dụng: Functional Test cho các bước checkout, Integration Test cho giao tiếp API thanh toán, và System Test để kiểm tra toàn bộ luồng đặt hàng đến cập nhật đơn.
Rà soát: Review Code & API để đảm bảo logic tính tiền, xử lý đơn và phản hồi từ gateway thanh toán chính xác, không lỗi logic.

Quản trị (Admin)
Kiểm thử các chức năng quản lý người dùng, người bán, sản phẩm, sự kiện, đơn hàng và phê duyệt rút tiền.
Áp dụng: Functional Test để đảm bảo đúng quyền truy cập; System Test cho các thao tác CRUD phức tạp.
Rà soát: Review UI & Test Plan để xác nhận giao diện quản trị thân thiện, không trùng lặp chức năng.

Chat thời gian thực (Real-time Chat)
Kiểm thử chức năng nhắn tin giữa người mua và người bán thông qua Socket.io, bao gồm gửi, nhận tin nhắn và hiển thị trạng thái hoạt động.
Áp dụng: Integration Test để kiểm tra kết nối giữa frontend và server, đảm bảo tin nhắn hiển thị tức thời.
Rà soát: Review Code và Test Case phần socket để đảm bảo không mất gói tin, lỗi kết nối hoặc lỗi hiển thị.

Người bán (Seller)
Bao gồm đăng ký, đăng nhập, quản lý sản phẩm (CRUD), tạo sự kiện khuyến mãi, xem đơn hàng, yêu cầu rút tiền, tạo mã giảm giá và cài đặt thông tin shop.
Áp dụng: Functional Test cho thao tác CRUD và System Test cho quy trình tạo sản phẩm – bán – xử lý đơn.
Rà soát: Review Test Case để đảm bảo mỗi chức năng được kiểm thử đủ cả luồng hợp lệ và không hợp lệ (ví dụ: nhập sai giá, xóa sản phẩm chưa lưu).
Wishlist và Giỏ hàng
Kiểm thử việc thêm, xóa, thay đổi số lượng sản phẩm trong giỏ hàng, tính tổng tiền, và áp mã giảm giá.
Áp dụng: Functional Test cho tính toán, Integration Test cho việc đồng bộ dữ liệu giỏ hàng với backend.
Rà soát: Review Logic và Test Result để đảm bảo công thức tính tiền chính xác và các thao tác giỏ hàng phản hồi đúng.
1.2 Mục tiêu
Kiểm tra các chức năng chính đã có hoạt động đúng: đăng ký/đăng nhập, xem sản phẩm, giỏ hàng, thanh toán, đơn hàng, chat.
Xem thử quyền từng vai trò (User/Seller/Admin) có đúng không, không cho vào trang hay API không thuộc quyền.
Tính tiền phải đúng: số lượng, phí, mã giảm giá; mua xong thì đơn hàng lưu lại và tồn kho giảm.
Thanh toán thử bằng PayPal/Stripe/COD ở chế độ thử (sandbox): thành công thì lưu đơn, thất bại thì báo lỗi rõ ràng.
Giao diện ở các trang chính hiển thị ổn, dùng được trên máy tính và điện thoại ở mức cơ bản; có thông báo khi thao tác thành công/thất bại.
Dữ liệu người dùng phải được bảo vệ: không sửa/xem được thông tin, đơn hàng của người khác; chặn nhập liệu “bậy bạ”.
Sau khi sửa lỗi, chạy lại nhanh những chức năng liên quan để chắc không bị “vỡ” chỗ khác.
Kết quả nộp: danh sách test case, bảng kết quả chạy, danh sách lỗi (có mức độ), và xác nhận đã kiểm tra lại sau khi fix.
Điều kiện kết thúc đợt test:
Không còn lỗi nặng; các bài test về đăng nhập và thanh toán đều qua.
Tỷ lệ pass cao (khoảng ≥ 95%); lỗi vừa/nhẹ nếu còn thì có cách xử lý tạm thời chấp nhận được.

1.3 Tổng quan
Kiểm thử được thực hiện trên bản web hiện tại, trong môi trường test với dữ liệu giả lập và cổng thanh toán sandbox; trình duyệt mục tiêu: Chrome/Firefox/Edge bản mới nhất trên desktop và mobile web cơ bản. Phạm vi kiểm thử gồm: functional, integration, UI . Kết quả bàn giao: bộ test cases, kết quả thực thi và danh sách lỗi 2. Tài liệu tham khảo

STT
Tên tài liệu / Nguồn tham khảo
Mô tả nội dung / Lý do tham khảo
1
Software Quality Assurance – Fundamentals and Best Practices (by Daniel Galin)
Tài liệu nền tảng về các khái niệm, tiêu chuẩn và phương pháp thực hành trong đảm bảo chất lượng phần mềm. Dùng để xây dựng quy trình SQA của dự án.
2
ISO/IEC 25010:2011 – Systems and Software Quality Models
Tiêu chuẩn quy định các đặc tính chất lượng phần mềm như tính năng, hiệu suất, khả năng sử dụng, bảo mật và khả năng bảo trì. Dùng để xác định tiêu chí đánh giá chất lượng cho dự án MERN Marketplace.
3
IEEE 829-2008 – Standard for Software and System Test Documentation
Tiêu chuẩn hướng dẫn cách xây dựng tài liệu kiểm thử (test plan, test case, test report, test summary) để đảm bảo tính đầy đủ và thống nhất trong hoạt động kiểm thử.
4
ReactJS Official Documentation (https://react.dev/)
Tham khảo về cách tổ chức component, state management, và các kỹ thuật tối ưu hiệu năng cho giao diện người dùng.
5
MongoDB Documentation (https://www.mongodb.com/docs/)
Tham khảo để hiểu cơ chế lưu trữ dữ liệu phi quan hệ, cấu trúc collection, và cách tối ưu truy vấn trong hệ thống backend.
6
NodeJS & ExpressJS Documentation (https://expressjs.com/)
Cung cấp hướng dẫn về cách xây dựng REST API, middleware, và xử lý request/response trong hệ thống backend.
7
Stripe & PayPal Developer API
Tham khảo cấu trúc API và quy trình tích hợp thanh toán trực tuyến an toàn trong hệ thống thương mại điện tử.
8
JMeter / Postman Testing Tools Documentation
Tài liệu tham khảo cho quá trình kiểm thử API và kiểm tra hiệu năng hệ thống.
9
Socket.io Documentation
Tài liệu hỗ trợ triển khai tính năng chat thời gian thực giữa người mua và người bán trong hệ thống

3. Định nghĩa và Thuật ngữ viết tắt

Thuật ngữ / Viết tắt
Định nghĩa / Giải thích
SQA
Software Quality Assurance – Đảm bảo chất lượng phần mềm, bao gồm các hoạt động nhằm đảm bảo sản phẩm đáp ứng tiêu chuẩn và yêu cầu đã đề ra.
QA
Quality Assurance – Quá trình giám sát, kiểm soát chất lượng xuyên suốt vòng đời phát triển phần mềm.
QC
Quality Control – Hoạt động kiểm tra, đánh giá và phát hiện lỗi trong sản phẩm phần mềm.
MERN
Viết tắt của MongoDB, ExpressJS, ReactJS và NodeJS – bốn công nghệ chính tạo nên ứng dụng.
API
Application Programming Interface – Giao diện lập trình ứng dụng, giúp frontend và backend giao tiếp với nhau.
UI/UX
User Interface / User Experience – Giao diện và trải nghiệm người dùng.
CRUD
Create, Read, Update, Delete – Các thao tác cơ bản trên dữ liệu trong ứng dụng.
JWT
JSON Web Token – Phương thức xác thực người dùng an toàn trong ứng dụng web.
CI/CD
Continuous Integration / Continuous Deployment – Quy trình tích hợp và triển khai liên tục trong phát triển phần mềm.
COD
Cash on Delivery – Phương thức thanh toán khi nhận hàng.
Test Case
Bộ kiểm thử mô tả các bước, điều kiện và kết quả mong đợi khi kiểm tra một chức năng cụ thể.

4. Vai trò và Trách nhiệm

Vai trò
Thành viên
Mô tả nhiệm vụ
Tester Leader
Lâm Tiến Dưỡng
• Lập SQA Plan, duyệt và chuẩn hóa toàn bộ test plan của nhóm.
• Review đặc tả chức năng (Functional Spec) và Test Case trước khi thực thi.
• Quản lý tiến độ kiểm thử, lập checklist chung và điều phối họp chốt lỗi.
• Thực hiện test manual cho các chức năng được phân công.
• Thực hiện review kết quả kiểm thử (Test Result Review) để đảm bảo báo cáo lỗi chính xác, không trùng lặp.
• Thiết kế và kiểm thử các chức năng:
(1) Wishlist và Giỏ hàng
 (2) Thanh toán và đơn hàng

 
Tester
Bùi Xuân Đăng
• Viết và chuẩn hóa đặc tả chức năng (Functional Specification) cho các module được phân công.
• Review code frontend (React.js) liên quan đến UI và logic người dùng.
• Thực hiện review Test Case của thành viên khác để đảm bảo độ bao phủ và tính hợp lệ.
• Lập test plan phần mình, lập checklist màn hình liên quan.
• Thực hiện manual test và UI review các màn hình chính.
• Thiết kế và kiểm thử các chức năng:
 (1) Người bán (Seller)
 (2) Chat thời gian thực (Real-time Chat)
Tester
Nguyễn Đức An
• Xây dựng checklist J3 cho các luồng chính (Login, Checkout, Payment).
• Review API và dữ liệu trong MongoDB sau khi test để đảm bảo tính toàn vẹn dữ liệu.
• Viết đặc tả phi chức năng theo McCall (tính tin cậy, khả năng bảo trì, tính dùng được).
• Lập test plan phần mình, thực hiện manual test và API test bằng Postman.
• Review Test Result và Defect Log, đảm bảo lỗi được ghi nhận và mô tả rõ ràng.
• Thiết kế và kiểm thử các chức năng:
(1) Quản trị (Admin)
 (2) Danh mục sản phẩm và tìm kiếm

5. Tiêu chuẩn và Hướng dẫn

Khu vực dự án (Project Area)
Tiêu chuẩn hoặc Hướng dẫn áp dụng
Đảm bảo và kiểm thử chất lượng phần mềm
IEEE 829 (Test Documentation Standard) – Tiêu chuẩn quốc tế hướng dẫn cách lập và quản lý tài liệu kiểm thử, gồm Test Plan, Test Case, Test Report. Áp dụng để chuẩn hóa quy trình kiểm thử và đảm bảo tính nhất quán trong tài liệu.
Đánh giá chất lượng phần mềm theo chức năng
ISO/IEC 25010:2011 (rút gọn – Functional Suitability) – Chỉ áp dụng phần tính phù hợp chức năng (Functional Suitability) để đánh giá phần mềm có đáp ứng đúng và đủ yêu cầu chức năng hay không.

6. Các Hoạt động Đảm bảo Chất lượng

Các hoạt động đảm bảo chất lượng trong dự án chủ yếu tập trung vào kiểm thử phần mềm nhằm xác minh và xác nhận rằng hệ thống đáp ứng đúng các yêu cầu chức năng đã được mô tả trong đặc tả.
Việc kiểm thử được thực hiện xuyên suốt trong quá trình phát triển để phát hiện và phát hiện lỗi , giúp đảm bảo sản phẩm cuối cùng đạt yêu cầu về tính đúng đắn và ổn định chức năng.
Tất cả các hoạt động kiểm thử và đảm bảo chất lượng của dự án tuân theo quy trình và tiêu chuẩn kiểm thử đã được quy định trong kế hoạch SQA này.

6.1 Các đợt rà soát tài liệu được đề xuất cho dự án
Dưới đây là danh sách các đánh giá sẽ được thực hiện trong dự án cho từng loại tài liệu (artifact):

Project artifact
Type of review
Reviewers
Ghi chú (vì sao chọn / có hay không)
Source code
Peer review (via Pull Request)
Toàn bộ team tester
Có mã nguồn thật; tất cả cùng review code qua GitHub PR.
Test plans
Formal/Managerial review
Toàn bộ team tester
Nhóm tự lập test plan, cần leader duyệt.
Test cases
Peer review (inspection)
Toàn bộ team tester
Có file testcase do nhóm tự tạo; cùng review độ bao phủ.
Test results
Walkthrough (demo)
Toàn bộ team tester
Thực hiện test, walkthrough kết quả để xác nhận bug.
Table scripts
Peer review (run test)
Toàn bộ team tester
Có script hoặc file seed DB (nếu có).

6.2 Chiến lược thử nghiệm được đề xuất cho dự án (Proposed Testing Strategy for the Project)
6.2.1. Mục tiêu kiểm thử
Phát hiện lỗi giao diện và lỗi chức năng khi thao tác người dùng.
Xác định mức độ hoạt động ổn định của các luồng chính trong ứng dụng.
Đảm bảo các chức năng cơ bản hoạt động đúng theo quan sát hoặc mô tả trong dự án GitHub.

6.2.2. Phạm vi kiểm thử
Thực hiện kiểm thử thủ công trên các module chính: Quản lý sản phẩm, Giỏ hàng, Thanh toán, Người bán, Chat thời gian thực, Trang quản trị.
Chỉ tiến hành kiểm thử chức năng và giao diện.
Kiểm thử được tiến hành trên môi trường local.

6.2.3. Lựa chọn người kiểm thử
Nhóm gồm 3 thành viên cùng tham gia quá trình kiểm thử.
Mỗi thành viên phụ trách một số module cụ thể.
Các đợt kiểm thử tích hợp và hệ thống được thực hiện chung bởi cả nhóm.

6.2.4. Môi trường kiểm thử
Frontend: ReactJS, Redux, TailwindCSS, MUI.
Backend: NodeJS, ExpressJS, MongoDB, JWT.
Công cụ hỗ trợ: Postman (kiểm thử API), Chrome DevTools (kiểm tra console, UI), VSCode (review mã nguồn).
Thực hiện trên môi trường local (máy cá nhân).

6.2.5. Tiêu chí Pass/Fail
Pass: Chức năng hoạt động đúng, không lỗi giao diện hoặc logic.
Fail: Kết quả sai, lỗi console, dữ liệu không đúng hoặc hệ thống dừng hoạt động.
Mức chấp nhận: Ít nhất 90% test case đạt yêu cầu, không có lỗi nghiêm trọng.

6.2.6. Tiêu chí hoàn thành kiểm thử
Tất cả test case trong kế hoạch được thực hiện ít nhất một lần.
Không còn lỗi nghiêm trọng hoặc lỗi tái xuất hiện sau khi kiểm tra lại.
Kết quả kiểm thử được ghi nhận trong bảng kết quả.

6.2.7. Chiến lược hồi quy (Regression Testing)
Sau khi sửa lỗi, kiểm tra lại các chức năng có liên quan.
Thực hiện hồi quy thủ công, không sử dụng công cụ tự động.

6.2.8. Thiết kế test case và công cụ sử dụng
Test case được thiết kế dựa trên hành vi người dùng thực tế.
Mỗi test case gồm: Mục tiêu, bước thực hiện, dữ liệu đầu vào, kết quả mong đợi và kết quả thực tế.
Ghi nhận test case và kết quả bằng Google Sheets hoặc Excel.

6.2.9. Kiểm thử trực quan (Intuitive Testing)
Do không có tài liệu đặc tả, sử dụng phương pháp kiểm thử trực quan dựa vào trải nghiệm người dùng.
Thực hiện kiểm tra luồng thao tác, giao diện và tính hợp lý trong sử dụng.

6.3 Các loại kiểm thử dự kiến thực hiện cho dự án

Project Test Unit
Type of Tests Proposed
Test Environment
Who Will Conduct the Test
Pass/Fail Criteria
Wishlist & Cart Module
Functional Test / Integration Test
Localhost environment (ReactJS + NodeJS + MongoDB)
Tester Leader – Lâm Tiến Dưỡng
Test Pass khi ≥ 95% test case đạt kết quả mong đợi (hiển thị sản phẩm, thêm/xóa sản phẩm, cập nhật số lượng, tổng giá trị chính xác). Fail nếu thao tác không phản ánh dữ liệu thực tế hoặc request trả về lỗi HTTP ≥ 400.
Payment & Order Module
Functional Test / End-to-End Test
Localhost + Stripe/PayPal sandbox API
Tester Leader – Lâm Tiến Dưỡng
Pass khi ≥ 90% test case thanh toán thành công (bao gồm Stripe, PayPal, COD), đơn hàng được lưu trong DB, trạng thái cập nhật đúng. Fail nếu hệ thống ghi sai đơn hàng, không phản hồi hoặc API trả lỗi.
Seller Management Module
Functional Test / Integration Test
Localhost (Seller Dashboard)
Tester – Bùi Xuân Đăng
Pass khi ≥ 95% test case CRUD sản phẩm, tạo sự kiện, quản lý đơn hàng hoạt động đúng, dữ liệu cập nhật vào MongoDB. Fail nếu bất kỳ thao tác CRUD nào không đồng bộ giữa giao diện và DB.
Real-time Chat Module
Functional Test / Realtime Communication Test
Localhost + Socket.io server
Tester – Bùi Xuân Đăng
Pass khi ≥ 90% test case tin nhắn được gửi và nhận giữa 2 user, hiển thị đúng thời gian, không mất kết nối socket. Fail khi trễ tin > 2s hoặc mất dữ liệu.
Admin Management Module
System Test / API Test
Localhost (Admin Dashboard) + Postman
Tester – Nguyễn Đức An
Pass khi ≥ 95% test case truy cập, duyệt, xóa người dùng, đơn hàng, seller hoạt động đúng, DB phản hồi chính xác. Fail nếu có lỗi truy vấn API, dữ liệu không đồng bộ.
Product & Search Module
Functional Test / UI Test
Localhost (Product Listing Page)
Tester – Nguyễn Đức An
Pass khi ≥ 95% test case kết quả tìm kiếm trả về đúng sản phẩm, bộ lọc hiển thị theo category chính xác. Fail khi dữ liệu hiển thị sai hoặc UI không phản hồi.
Acceptance Test (Final Demo)
System / Acceptance Test
Localhost full deployment
Cả nhóm
Pass khi tất cả chức năng chính trong README hoạt động đúng; không có bug mức độ nghiêm trọng (Severity 1) còn tồn tại. Fail nếu có lỗi nghiêm trọng gây ngừng hoạt động hệ thống.

7. Các chỉ số đề xuất thu thập cho dự án

Bảng sau liệt kê các chỉ số sẽ được thu thập trong suốt quá trình phát triển phần mềm, cùng với các giá trị chuẩn và mức chênh lệch cho phép.

Chỉ số
Chuẩn của dự án
Mức chênh lệch cho phép
Tần suất báo cáo
Năng suất (Productivity)
Giá trị phần trăm hoặc giá trị tuyệt đối
± 10% so với tiêu chuẩn
Hàng tuần/Hàng tháng
Chất lượng (Quality)
Tỷ lệ lỗi trung bình cho phép
± 5% so với tiêu chuẩn
Hàng tuần/Hàng tháng
Độ lệch tiến độ (Schedule Variance)
So với kế hoạch ban đầu
Không quá ± 10%
Hàng tuần
Độ lệch công sức (Effort Variance)
So với kế hoạch công sức ban đầu
Không quá ± 15%
Hàng tuần
Số lượng thay đổi (Change Requests)
Số yêu cầu thay đổi trong phạm vi dự án
Không quá 5% tổng số chức năng
Hàng tháng

8. Công cụ, Kỹ thuật và Phương pháp (Tools, Techniques, and Methodologies)

Công cụ
Mục đích sử dụng
Phạm vi áp dụng
Microsoft Word
Soạn thảo và lưu trữ tài liệu SQA Plan, Test Plan, Bug Report, và các tài liệu QA khác.
Quản lý tài liệu dự án.
Microsoft Excel / Google Sheets
Ghi lại kết quả test, theo dõi tiến độ, tạo bảng Test Case, Test Result Summary, và thống kê lỗi.
Báo cáo kết quả kiểm thử định kỳ.
Postman
Kiểm thử API backend Node.js, xác minh phản hồi JSON, mã trạng thái HTTP, và thời gian phản hồi.
Kiểm thử API (Register, Login, Product CRUD, Payment).
Jest + React Testing Library
Thực hiện kiểm thử đơn vị (Unit Test) và kiểm thử thành phần (Component Test) trên React.js frontend.
Frontend testing.
Selenium WebDriver / Cypress
Tự động hóa kịch bản kiểm thử giao diện người dùng như đăng nhập, đặt hàng, thanh toán.
Kiểm thử hồi quy (Regression) và UI.
MongoDB Compass
Kiểm tra dữ liệu sau khi thực hiện thao tác CRUD, đảm bảo dữ liệu lưu trữ đúng trong MongoDB.
Kiểm thử cơ sở dữ liệu.
JMeter
Kiểm thử hiệu năng và khả năng chịu tải của API (Load & Stress Testing).
Kiểm thử hiệu suất.
GitHub & GitHub Issues
Lưu trữ mã nguồn, quản lý version, và ghi nhận lỗi (defect tracking).
Quản lý lỗi và phối hợp nhóm.
VSCode
Môi trường lập trình chính, tích hợp kiểm thử đơn vị và debug code.
Phát triển và kiểm thử.

9. Phân tích nguyên nhân đề xuất (Causal Analysis Proposed)
   9.1 Mục tiêu
   Phân tích nguyên nhân lỗi (Causal Analysis) được thực hiện nhằm xác định nguyên nhân gốc (Root Cause) của các lỗi phát sinh trong quá trình kiểm thử hệ thống MERN Marketplace, từ đó đưa ra biện pháp khắc phục và cải tiến quy trình kiểm thử cho các giai đoạn tiếp theo.

9.2 Quy trình phân tích nguyên nhân
Quy trình được áp dụng cho mọi lỗi được ghi nhận trong giai đoạn kiểm thử chức năng (Functional Test), kiểm thử tích hợp (Integration Test), và kiểm thử hệ thống (System Test).

Bước
Hoạt động
Người chịu trách nhiệm

1. Ghi nhận lỗi
   Ghi lỗi vào file “Defect Tracking.xlsx” hoặc GitHub Issues, gồm mô tả, ảnh minh họa, mức độ nghiêm trọng (Critical/High/Medium/Low).
   Tester
2. Phân loại lỗi
   Phân nhóm lỗi theo loại: logic code, giao diện (UI/UX), cơ sở dữ liệu, API, phân quyền hoặc hiệu năng.
   QA Leader
3. Đề xuất biện pháp khắc phục
   Xác định hướng xử lý như bổ sung kiểm tra đầu vào, cập nhật test case, hoặc điều chỉnh logic code.
   Developer / QA

10 Huấn luyện (Trainning)
10.1 Mục tiêu
Chương trình đào tạo được thực hiện nhằm đảm bảo tất cả thành viên trong nhóm hiểu rõ quy trình kiểm thử, sử dụng thành thạo công cụ QA, và nắm được các kỹ thuật kiểm thử áp dụng cho dự án MERN Marketplace.
Mục tiêu của hoạt động đào tạo bao gồm:
Giúp các thành viên nắm được quy trình phát hiện, ghi nhận và báo cáo lỗi.
Đảm bảo tester sử dụng đúng công cụ và kỹ thuật đã được thống nhất.
Chuẩn hóa quy trình kiểm thử trong nhóm, tăng hiệu quả phối hợp giữa
Developer – QA – Leader.
10.2 Nội dung đào tạo

Chủ đề đào tạo
Công cụ / Kỹ thuật sử dụng
Người hướng dẫn
Mục tiêu đạt được
Quy trình QA và viết Test Case
Microsoft Word, Excel
QA Leader – Lâm Tiến Dưỡng
Hướng dẫn cách viết Test Case, cách ghi lỗi và lập báo cáo kết quả test.
Kiểm thử API Backend
Postman
Nguyễn Đức An
Giúp tester có thể tạo, gửi request và xác minh response của các API (đăng nhập, sản phẩm, thanh toán).
Kiểm thử giao diện React
Jest + React Testing Library
Bùi Xuân Đăng
Hướng dẫn tạo test đơn vị cho component, kiểm tra hiển thị UI và hành vi người dùng.
Quản lý lỗi và theo dõi tiến độ
GitHub Issues, Google Sheets
QA Leader
Giúp các thành viên ghi nhận bug, gắn nhãn mức độ (Critical, High, Medium, Low) và theo dõi trạng thái sửa lỗi.
Kỹ thuật kiểm thử phần mềm
Phân vùng tương đương, giá trị biên, test tiêu cực
Cả nhóm QA thảo luận
Áp dụng kỹ thuật thiết kế test case hiệu quả, tránh trùng lặp và tăng độ bao phủ.

10.3 Kết quả mong đợi

100% thành viên hiểu và tuân thủ quy trình kiểm thử chung.
Các test case được viết thống nhất theo mẫu chuẩn.
Giảm thiểu sai sót khi ghi nhận lỗi và báo cáo kết quả.
Đảm bảo hoạt động QA diễn ra thống nhất, liên tục và có tính kế thừa trong toàn bộ dự án.
