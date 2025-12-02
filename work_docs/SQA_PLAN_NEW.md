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

Tài liệu Kế hoạch Đảm bảo Chất lượng Phần mềm được xây dựng để kiểm thử cho dự án ứng dụng mobile SportHawk - hệ thống quản lý câu lạc bộ thể thao.

Phạm vi của kế hoạch này tập trung vào việc kiểm thử các chức năng cốt lõi của ứng dụng mobile, đồng thời tiến hành rà soát (review) mã nguồn, tài liệu và test case của sản phẩm.

**Event (Sự kiện)**
Kiểm thử các chức năng tạo sự kiện, chỉnh sửa sự kiện, xóa sự kiện, mời thành viên tham gia, theo dõi phản hồi của thành viên (available/unavailable), chọn đội hình (squad selection), và xem chi tiết sự kiện.
Áp dụng: Kiểm thử chức năng (Functional Test) và Kiểm thử tích hợp (Integration Test) để đảm bảo dữ liệu từ Supabase hiển thị đúng trên giao diện React Native.
Rà soát: Review Test Case để đảm bảo bao phủ đủ các trường hợp tạo/chỉnh sửa sự kiện, tránh bỏ sót tình huống biên (ví dụ: tạo sự kiện không có ngày giờ, mời thành viên không tồn tại).

**Payment (Thanh toán)**
Bao gồm toàn bộ quy trình tạo yêu cầu thanh toán (payment request), xem chi tiết thanh toán, xử lý thanh toán qua Stripe, xem lịch sử thanh toán, hủy yêu cầu thanh toán, và tính toán phí Stripe.
Áp dụng: Functional Test cho các bước tạo và xử lý thanh toán, Integration Test cho giao tiếp API Stripe, và System Test để kiểm tra toàn bộ luồng từ tạo yêu cầu đến hoàn tất thanh toán.
Rà soát: Review Code & API để đảm bảo logic tính tiền, tính phí Stripe và xử lý phản hồi từ Stripe chính xác, không lỗi logic.

**Club (Câu lạc bộ)**
Kiểm thử các chức năng xem danh sách câu lạc bộ, tìm kiếm câu lạc bộ, xem chi tiết câu lạc bộ, và quản lý thông tin câu lạc bộ.
Áp dụng: Functional Test để đảm bảo hiển thị danh sách và chi tiết đúng; Integration Test cho việc đồng bộ dữ liệu từ Supabase.
Rà soát: Review UI & Test Plan để xác nhận giao diện hiển thị thân thiện, dữ liệu được lấy và hiển thị chính xác.

**Notification (Thông báo)**
Kiểm thử chức năng gửi và nhận thông báo đẩy (push notification) cho các sự kiện như: mời tham gia sự kiện, nhắc nhở sự kiện, phản hồi sự kiện, được chọn vào đội hình, yêu cầu thanh toán, nhắc nhở thanh toán, và xác nhận thanh toán.
Áp dụng: Integration Test để kiểm tra kết nối giữa frontend và hệ thống thông báo, đảm bảo thông báo được gửi và hiển thị đúng thời điểm.
Rà soát: Review Code và Test Case phần notification để đảm bảo thông báo được trigger đúng các sự kiện, không bị mất thông báo hoặc gửi trùng lặp.

**Team-member (Thành viên đội)**
Bao gồm các chức năng xem danh sách thành viên đội, quản lý thành viên (thêm/xóa), xem thông tin chi tiết thành viên, và quản lý quyền truy cập (admin/member).
Áp dụng: Functional Test cho thao tác quản lý thành viên và System Test cho quy trình từ yêu cầu tham gia đến chấp nhận/từ chối.
Rà soát: Review Test Case để đảm bảo mỗi chức năng được kiểm thử đủ cả luồng hợp lệ và không hợp lệ (ví dụ: thêm thành viên đã tồn tại, xóa thành viên không có quyền).

1.2 Mục tiêu

Kiểm tra các chức năng chính đã có hoạt động đúng: quản lý sự kiện (tạo, sửa, xóa, chọn đội hình), thanh toán (tạo yêu cầu, xử lý thanh toán, lịch sử), quản lý câu lạc bộ, hệ thống thông báo, và quản lý thành viên đội.

Xem thử quyền từng vai trò (Team Admin/Team Member/Club Admin) có đúng không, không cho vào trang hay API không thuộc quyền.

Tính tiền và phí Stripe phải đúng: số tiền, phí giao dịch, tổng thanh toán; thanh toán xong thì dữ liệu được lưu lại và cập nhật trạng thái đúng.

Thanh toán thử bằng Stripe ở chế độ test mode: thành công thì lưu dữ liệu, thất bại thì báo lỗi rõ ràng.

Giao diện ở các màn hình chính hiển thị ổn, dùng được trên iOS và Android ở mức cơ bản; có thông báo khi thao tác thành công/thất bại.

Dữ liệu người dùng phải được bảo vệ: không sửa/xem được thông tin, sự kiện, thanh toán của người khác; chặn nhập liệu không hợp lệ.

Sau khi sửa lỗi, chạy lại nhanh những chức năng liên quan để chắc không bị "vỡ" chỗ khác.

Kết quả nộp: danh sách test case, bảng kết quả chạy, danh sách lỗi (có mức độ), và xác nhận đã kiểm tra lại sau khi fix.

Điều kiện kết thúc đợt test:
Không còn lỗi nặng; các bài test về quản lý sự kiện và thanh toán đều qua.
Tỷ lệ pass cao (khoảng ≥ 95%); lỗi vừa/nhẹ nếu còn thì có cách xử lý tạm thời chấp nhận được.

1.3 Tổng quan

Kiểm thử được thực hiện trên ứng dụng mobile SportHawk hiện tại, trong môi trường test với dữ liệu giả lập và cổng thanh toán Stripe test mode; thiết bị mục tiêu: iOS và Android simulator/emulator. Phạm vi kiểm thử gồm: functional test, integration test, và UI test. Các hoạt động chủ yếu là test và review mã nguồn, test case, và tài liệu. Kết quả bàn giao: bộ test cases, kết quả thực thi và danh sách lỗi.

2. Tài liệu tham khảo

STT
Tên tài liệu / Nguồn tham khảo
Mô tả nội dung / Lý do tham khảo
1
Software Quality Assurance – Fundamentals and Best Practices (by Daniel Galin)
Tài liệu nền tảng về các khái niệm, tiêu chuẩn và phương pháp thực hành trong đảm bảo chất lượng phần mềm. Dùng để xây dựng quy trình SQA của dự án.
2
ISO/IEC 25010:2011 – Systems and Software Quality Models
Tiêu chuẩn quy định các đặc tính chất lượng phần mềm như tính năng, hiệu suất, khả năng sử dụng, bảo mật và khả năng bảo trì. Dùng để xác định tiêu chí đánh giá chất lượng cho dự án SportHawk.
3
IEEE 829-2008 – Standard for Software and System Test Documentation
Tiêu chuẩn hướng dẫn cách xây dựng tài liệu kiểm thử (test plan, test case, test report, test summary) để đảm bảo tính đầy đủ và thống nhất trong hoạt động kiểm thử.
4
React Native Official Documentation (https://reactnative.dev/)
Tham khảo về cách tổ chức component, state management, và các kỹ thuật phát triển ứng dụng mobile cho iOS và Android.
5
Expo Documentation (https://docs.expo.dev/)
Tham khảo về cách sử dụng Expo SDK, Expo Router, và các API của Expo như notifications, secure store, image picker.
6
Supabase Documentation (https://supabase.com/docs)
Tham khảo để hiểu cơ chế lưu trữ dữ liệu PostgreSQL, Row Level Security (RLS), authentication, và cách sử dụng Supabase client trong React Native.
7
Stripe React Native SDK Documentation (https://stripe.dev/stripe-react-native/)
Tham khảo cấu trúc API và quy trình tích hợp thanh toán Stripe trong ứng dụng React Native, bao gồm payment intent và Stripe Connect.
8
Jest Documentation (https://jestjs.io/)
Tài liệu tham khảo cho quá trình viết và chạy unit test, integration test trong dự án React Native.
9
TypeScript Documentation (https://www.typescriptlang.org/docs/)
Tham khảo về cách sử dụng TypeScript trong dự án để đảm bảo type safety và giảm thiểu lỗi trong quá trình phát triển.

3. Định nghĩa và Thuật ngữ viết tắt

Thuật ngữ / Viết tắt
Định nghĩa / Giải thích
SQA
Software Quality Assurance – Đảm bảo chất lượng phần mềm, bao gồm các hoạt động nhằm đảm bảo sản phẩm đáp ứng tiêu chuẩn và yêu cầu đã đề ra.
QA
Quality Assurance – Quá trình giám sát, kiểm soát chất lượng xuyên suốt vòng đời phát triển phần mềm.
QC
Quality Control – Hoạt động kiểm tra, đánh giá và phát hiện lỗi trong sản phẩm phần mềm.
API
Application Programming Interface – Giao diện lập trình ứng dụng, giúp frontend và backend giao tiếp với nhau.
UI/UX
User Interface / User Experience – Giao diện và trải nghiệm người dùng.
CRUD
Create, Read, Update, Delete – Các thao tác cơ bản trên dữ liệu trong ứng dụng.
RLS
Row Level Security – Bảo mật cấp hàng trong PostgreSQL, được sử dụng trong Supabase để kiểm soát quyền truy cập dữ liệu.
Test Case
Bộ kiểm thử mô tả các bước, điều kiện và kết quả mong đợi khi kiểm tra một chức năng cụ thể.
Expo
Framework và công cụ phát triển ứng dụng React Native, cung cấp các API và dịch vụ hỗ trợ phát triển mobile app.
Supabase
Backend-as-a-Service (BaaS) cung cấp database PostgreSQL, authentication, storage và edge functions cho ứng dụng.
Stripe Connect
Giải pháp thanh toán của Stripe cho marketplace, cho phép chuyển tiền trực tiếp từ người dùng đến tài khoản của câu lạc bộ.
Payment Request
Yêu cầu thanh toán được tạo bởi Team Admin để thu tiền từ các thành viên đội.
Squad Selection
Quá trình Team Admin chọn các thành viên sẽ tham gia sự kiện (event) từ danh sách những người đã phản hồi available.
Push Notification
Thông báo đẩy được gửi đến thiết bị người dùng thông qua Expo Push Service để thông báo về các sự kiện quan trọng.

4. Vai trò và Trách nhiệm

Vai trò
Thành viên
Mô tả nhiệm vụ
Tester Leader
Lâm Tiến Dưỡng
• Lập SQA Plan, duyệt và chuẩn hóa toàn bộ test plan của nhóm.
• Review đặc tả chức năng (Functional Spec) và Test Case trước khi thực thi.
• Quản lý tiến độ kiểm thử, lập checklist chung và điều phối họp chốt lỗi.
• Thực hiện review kết quả kiểm thử (Test Result Review) để đảm bảo báo cáo lỗi chính xác, không trùng lặp.
• Thiết kế và kiểm thử chức năng Event (Sự kiện):
(1) Xây dựng checklist J6 cho Event
(2) Thực hiện System Test cho Event
(3) Thực hiện Unit Test cho Event
(4) Review code và test case liên quan đến Event

Tester
Bùi Xuân Đang
• Viết và chuẩn hóa đặc tả chức năng (Functional Specification) cho các module được phân công.
• Review code frontend (React Native) liên quan đến UI và logic người dùng.
• Thực hiện review Test Case của thành viên khác để đảm bảo độ bao phủ và tính hợp lệ.
• Thiết kế và kiểm thử các chức năng:
(1) Payment (Thanh toán): - Xây dựng checklist J6 cho Payment - Thực hiện System Test cho Payment - Thực hiện Unit Test cho Payment
(2) Club (Câu lạc bộ): - Xây dựng checklist J6 cho Club - Thực hiện System Test cho Club - Thực hiện Unit Test cho Club

Tester
Nguyễn Đức An
• Viết đặc tả phi chức năng theo các tiêu chí chất lượng phần mềm (tính tin cậy, khả năng bảo trì, tính dùng được).
• Xây dựng checklist J3 cho các luồng chính trong ứng dụng.
• Review API và dữ liệu trong Supabase sau khi test để đảm bảo tính toàn vẹn dữ liệu.
• Review Test Result và Defect Log, đảm bảo lỗi được ghi nhận và mô tả rõ ràng.
• Thiết kế và kiểm thử các chức năng:
(1) Notification (Thông báo): - Xây dựng checklist J6 cho Notification - Thực hiện System Test cho Notification - Thực hiện Unit Test cho Notification
(2) Team-member (Thành viên đội): - Xây dựng checklist J6 cho Team-member - Thực hiện System Test cho Team-member - Thực hiện Unit Test cho Team-member

5. Tiêu chuẩn và Hướng dẫn

Khu vực dự án (Project Area)
Tiêu chuẩn hoặc Hướng dẫn áp dụng
Đảm bảo và kiểm thử chất lượng phần mềm
IEEE 829 (Test Documentation Standard) – Tiêu chuẩn quốc tế hướng dẫn cách lập và quản lý tài liệu kiểm thử, gồm Test Plan, Test Case, Test Report. Áp dụng để chuẩn hóa quy trình kiểm thử và đảm bảo tính nhất quán trong tài liệu.
Đánh giá chất lượng phần mềm theo chức năng
ISO/IEC 25010:2011 (rút gọn – Functional Suitability) – Chỉ áp dụng phần tính phù hợp chức năng (Functional Suitability) để đánh giá phần mềm có đáp ứng đúng và đủ yêu cầu chức năng hay không.

6. Các Hoạt động Đảm bảo Chất lượng

Các hoạt động đảm bảo chất lượng trong dự án chủ yếu tập trung vào kiểm thử phần mềm nhằm xác minh và xác nhận rằng hệ thống đáp ứng đúng các yêu cầu chức năng đã được mô tả trong đặc tả.
Việc kiểm thử được thực hiện xuyên suốt trong quá trình phát triển để phát hiện lỗi, giúp đảm bảo sản phẩm cuối cùng đạt yêu cầu về tính đúng đắn và ổn định chức năng.
Tất cả các hoạt động kiểm thử và đảm bảo chất lượng của dự án tuân theo quy trình và tiêu chuẩn kiểm thử đã được quy định trong kế hoạch SQA này.

6.1 Các đợt rà soát tài liệu được đề xuất cho dự án

Dưới đây là danh sách các đánh giá sẽ được thực hiện trong dự án cho từng loại tài liệu (artifact). Mỗi loại review được giải thích rõ ràng về mục đích, cách thức thực hiện và lý do lựa chọn.

**Source code (Mã nguồn)**

- **Loại review:** Peer review (via Pull Request trên GitHub)
- **Người review:** Toàn bộ team tester (3 thành viên)
- **Mục đích:** Kiểm tra chất lượng code, logic xử lý, tuân thủ coding standards, và phát hiện lỗi tiềm ẩn trước khi merge vào main branch.
- **Cách thực hiện:** Mỗi khi có thay đổi code, tạo Pull Request trên GitHub. Tất cả thành viên cùng xem xét code, đưa ra nhận xét và yêu cầu sửa đổi nếu cần. Code chỉ được merge khi có ít nhất 1 approval từ thành viên khác.
- **Lý do chọn:** Dự án có mã nguồn thật được lưu trữ trên GitHub. Review code qua PR là cách hiệu quả để đảm bảo chất lượng và chia sẻ kiến thức trong nhóm.

**Test plans (Kế hoạch kiểm thử)**

- **Loại review:** Formal/Managerial review
- **Người review:** Toàn bộ team tester, Leader (Lâm Tiến Dưỡng) duyệt cuối cùng
- **Mục đích:** Đảm bảo test plan của mỗi thành viên đầy đủ, nhất quán và phù hợp với mục tiêu kiểm thử chung của dự án.
- **Cách thực hiện:** Mỗi thành viên tự lập test plan cho các module được phân công (Event, Payment+Club, Notification+Team-member). Các thành viên khác review và đưa ra góp ý. Leader xem xét và duyệt cuối cùng để đảm bảo tính nhất quán.
- **Lý do chọn:** Test plan là tài liệu quan trọng định hướng toàn bộ quá trình kiểm thử. Cần có sự thống nhất giữa các thành viên và sự phê duyệt từ leader.

**Test cases (Các trường hợp kiểm thử)**

- **Loại review:** Peer review (inspection)
- **Người review:** Toàn bộ team tester
- **Mục đích:** Kiểm tra độ bao phủ của test cases, tính hợp lệ của các test case, và đảm bảo test cases được viết đúng format (Jest test files).
- **Cách thực hiện:** Test cases được viết dưới dạng Jest test files (ví dụ: `createEvent.test.ts`, `paymentCaculationiStripeFee.test.ts`). Các thành viên cùng review các test files để kiểm tra: test cases có bao phủ đủ các trường hợp (happy path, edge cases, error cases), assertions có đúng không, mocks có được setup đúng không.
- **Lý do chọn:** Dự án sử dụng Jest làm framework test. Test cases được viết bằng code (TypeScript), không phải document. Cần review để đảm bảo chất lượng test code.

**Test results (Kết quả kiểm thử)**

- **Loại review:** Walkthrough (demo)
- **Người review:** Toàn bộ team tester
- **Mục đích:** Xác nhận bug được phát hiện là thật, kết quả test được ghi nhận chính xác, và đảm bảo không có sự nhầm lẫn trong việc đánh giá pass/fail.
- **Cách thực hiện:** Sau khi chạy test (bằng lệnh `npm test` hoặc `npm run test:event`), người test trình bày kết quả cho cả nhóm. Cả nhóm cùng xem xét: test có chạy đúng không, kết quả có đúng với expected không, bug có được mô tả rõ ràng không. Nếu có bug, cả nhóm cùng xác nhận và ghi vào defect log.
- **Lý do chọn:** Walkthrough giúp tránh nhầm lẫn trong việc đánh giá kết quả test và đảm bảo bug được ghi nhận chính xác trước khi báo cáo.

**Functional Specification (Đặc tả chức năng)**

- **Loại review:** Peer review
- **Người review:** Toàn bộ team tester
- **Mục đích:** Đảm bảo đặc tả chức năng mô tả đầy đủ, chính xác và rõ ràng các chức năng cần test, giúp các thành viên khác hiểu đúng yêu cầu.
- **Cách thực hiện:** Bùi Xuân Đang viết đặc tả chức năng cho các module Payment và Club. Các thành viên khác review để kiểm tra: mô tả có đầy đủ các chức năng không, có rõ ràng về input/output không, có mô tả các trường hợp đặc biệt không.
- **Lý do chọn:** Đặc tả chức năng là tài liệu quan trọng định hướng việc test. Cần review để đảm bảo tính đầy đủ và chính xác.

**Non-functional Specification (Đặc tả phi chức năng)**

- **Loại review:** Peer review
- **Người review:** Toàn bộ team tester
- **Mục đích:** Đảm bảo các tiêu chí chất lượng phần mềm (tính tin cậy, khả năng bảo trì, tính dùng được, hiệu suất) được xác định rõ ràng và có thể đo lường được.
- **Cách thực hiện:** Nguyễn Đức An viết đặc tả phi chức năng theo các tiêu chí chất lượng. Các thành viên khác review để kiểm tra: các tiêu chí có rõ ràng không, có thể đo lường được không, có phù hợp với dự án mobile app không.
- **Lý do chọn:** Đặc tả phi chức năng giúp định hướng việc đánh giá chất lượng phần mềm. Cần review để đảm bảo các tiêu chí được xác định đúng và phù hợp.

  6.2 Chiến lược thử nghiệm được đề xuất cho dự án (Proposed Testing Strategy for the Project)

  6.2.1. Mục tiêu kiểm thử

Phát hiện lỗi chức năng và lỗi giao diện khi người dùng thao tác trên ứng dụng mobile (iOS và Android).

Xác định mức độ hoạt động ổn định của các luồng chính trong ứng dụng: tạo sự kiện, xử lý thanh toán, quản lý câu lạc bộ, hệ thống thông báo, và quản lý thành viên đội.

Đảm bảo các chức năng cơ bản hoạt động đúng theo yêu cầu đã được mô tả trong đặc tả chức năng và đặc tả phi chức năng.

6.2.2. Phạm vi kiểm thử

Thực hiện kiểm thử trên các module chính: Event (Sự kiện), Payment (Thanh toán), Club (Câu lạc bộ), Notification (Thông báo), và Team-member (Thành viên đội).

Các loại kiểm thử được thực hiện:

- **Unit Test:** Kiểm thử các hàm business logic, utility functions, và calculations (ví dụ: tính phí Stripe, format date, count invitation status).
- **Integration Test:** Kiểm thử các API functions với Supabase (ví dụ: create event, update payment, get team members).
- **System Test:** Kiểm thử toàn bộ luồng chức năng trên ứng dụng mobile (ví dụ: tạo sự kiện từ đầu đến cuối, thanh toán từ tạo request đến hoàn tất).

Kiểm thử được tiến hành trên môi trường local (máy cá nhân) với:

- iOS Simulator hoặc Android Emulator
- Supabase test database
- Stripe test mode

  6.2.3. Lựa chọn người kiểm thử

Nhóm gồm 3 thành viên cùng tham gia quá trình kiểm thử.

Mỗi thành viên phụ trách các module cụ thể:

- **Lâm Tiến Dưỡng (Leader):** Event
- **Bùi Xuân Đang:** Payment và Club
- **Nguyễn Đức An:** Notification và Team-member

Các đợt kiểm thử tích hợp và hệ thống được thực hiện chung bởi cả nhóm để đảm bảo các module hoạt động đúng khi tích hợp với nhau.

6.2.4. Môi trường kiểm thử

**Frontend:** React Native với Expo SDK, TypeScript, Expo Router.

**Backend:** Supabase (PostgreSQL database, Authentication, Storage, Edge Functions).

**Payment:** Stripe Connect API (test mode).

**Công cụ hỗ trợ:**

- **Jest:** Framework để viết và chạy unit test và integration test.
- **Expo Go / iOS Simulator / Android Emulator:** Để chạy ứng dụng và thực hiện system test.
- **VSCode:** Để review mã nguồn và viết test code.
- **GitHub:** Để quản lý code và review qua Pull Request.
- **Supabase Dashboard:** Để kiểm tra dữ liệu trong database sau khi test.

Thực hiện trên môi trường local (máy cá nhân của từng thành viên).

6.2.5. Tiêu chí Pass/Fail

**Pass:**

- Chức năng hoạt động đúng như mong đợi.
- Không có lỗi giao diện hoặc logic.
- Dữ liệu được lưu và cập nhật đúng trong Supabase.
- Test case chạy thành công và không có lỗi.

**Fail:**

- Chức năng không hoạt động hoặc hoạt động sai.
- Có lỗi console (error, warning nghiêm trọng).
- Dữ liệu không được lưu hoặc lưu sai trong database.
- Ứng dụng bị crash hoặc dừng hoạt động.
- Test case fail hoặc throw error.

**Mức chấp nhận:** Ít nhất 95% test case đạt yêu cầu (pass), không có lỗi nghiêm trọng (critical bugs).

6.2.6. Tiêu chí hoàn thành kiểm thử

Tất cả test case trong kế hoạch được thực hiện ít nhất một lần (bao gồm cả unit test, integration test, và system test).

Không còn lỗi nghiêm trọng (critical) hoặc lỗi cao (high) còn tồn tại. Các lỗi trung bình (medium) và thấp (low) nếu còn thì phải có cách xử lý tạm thời chấp nhận được.

Kết quả kiểm thử được ghi nhận đầy đủ trong bảng kết quả (test result summary) và defect log.

Tất cả các chức năng chính (Event, Payment, Club, Notification, Team-member) đều đã được test và có kết quả rõ ràng.

6.2.7. Chiến lược hồi quy (Regression Testing)

Sau khi sửa lỗi, kiểm tra lại các chức năng có liên quan để đảm bảo việc sửa lỗi không làm ảnh hưởng đến các chức năng khác.

Thực hiện hồi quy bằng cách:

- Chạy lại các test case liên quan (bằng lệnh `npm test`).
- Test lại các luồng chức năng chính trên ứng dụng mobile.
- Kiểm tra dữ liệu trong Supabase để đảm bảo không có side effects.

Thực hiện hồi quy thủ công, không sử dụng công cụ tự động hóa E2E test.

6.2.8. Thiết kế test case và công cụ sử dụng

**Thiết kế test case:**

- Test case được thiết kế dựa trên đặc tả chức năng và hành vi người dùng thực tế.
- Mỗi test case (trong Jest) gồm: mô tả test (describe/it), setup mocks, thực hiện test, kiểm tra kết quả (expect assertions).
- Test case phải bao phủ: happy path, edge cases (null, empty, invalid input), và error cases (database error, API error).

**Công cụ sử dụng:**

- **Jest:** Để viết và chạy unit test và integration test. Test files được lưu trong thư mục `tests/` hoặc `__tests__/`.
- **Google Sheets / Excel:** Để ghi nhận kết quả system test (manual test trên mobile app) và defect log.
- **GitHub Issues:** Để quản lý và theo dõi các bug được phát hiện.

  6.2.9. Kiểm thử trực quan (Manual Testing)

Do đây là ứng dụng mobile với giao diện người dùng, việc kiểm thử trực quan là rất quan trọng.

Thực hiện kiểm tra:

- Giao diện hiển thị đúng và đẹp trên iOS và Android.
- Các thao tác người dùng (tap, swipe, scroll) hoạt động mượt mà.
- Luồng thao tác hợp lý và dễ sử dụng.
- Thông báo (toast, alert) hiển thị đúng khi có lỗi hoặc thành công.

Kiểm thử được thực hiện trên iOS Simulator và Android Emulator, có thể test trên thiết bị thật nếu cần.

6.3 Các loại kiểm thử dự kiến thực hiện cho dự án

Bảng sau mô tả các loại kiểm thử sẽ được thực hiện cho từng module trong dự án SportHawk:

Project Test Unit
Type of Tests Proposed
Test Environment
Who Will Conduct the Test
Pass/Fail Criteria
Event (Sự kiện) Module
Unit Test / Integration Test / System Test
Jest (local) + React Native app (iOS/Android Simulator) + Supabase test database
Tester Leader – Lâm Tiến Dưỡng
Pass khi ≥ 95% test case đạt kết quả mong đợi. Unit test: các hàm utility (formatDateToYMD, countInvitationStatus) hoạt động đúng. Integration test: API functions (createEvent, updateEventById, deleteEvent) tương tác đúng với Supabase. System test: luồng tạo sự kiện từ đầu đến cuối hoạt động đúng trên mobile app. Fail nếu có lỗi logic, dữ liệu không được lưu đúng, hoặc ứng dụng crash.
Payment (Thanh toán) Module
Unit Test / Integration Test / System Test
Jest (local) + React Native app (iOS/Android Simulator) + Supabase test database + Stripe test mode
Tester – Bùi Xuân Đang
Pass khi ≥ 95% test case đạt kết quả mong đợi. Unit test: hàm tính phí Stripe (paymentCaculationiStripeFee) tính đúng, payment transformers hoạt động đúng. Integration test: API functions (createPaymentRequest, processPayment) tương tác đúng với Supabase và Stripe API. System test: luồng thanh toán từ tạo request đến hoàn tất hoạt động đúng. Fail nếu tính tiền sai, thanh toán không được lưu, hoặc Stripe API trả lỗi.
Club (Câu lạc bộ) Module
Unit Test / Integration Test / System Test
Jest (local) + React Native app (iOS/Android Simulator) + Supabase test database
Tester – Bùi Xuân Đang
Pass khi ≥ 95% test case đạt kết quả mong đợi. Unit test: các hàm xử lý dữ liệu club hoạt động đúng. Integration test: API functions (getClubs, getClubDetail) tương tác đúng với Supabase. System test: luồng xem danh sách và chi tiết câu lạc bộ hoạt động đúng trên mobile app. Fail nếu dữ liệu hiển thị sai, không lấy được từ database, hoặc UI không phản hồi.
Notification (Thông báo) Module
Unit Test / Integration Test / System Test
Jest (local) + React Native app (iOS/Android Simulator) + Expo Push Service (test mode)
Tester – Nguyễn Đức An
Pass khi ≥ 90% test case đạt kết quả mong đợi. Unit test: các hàm xử lý notification logic hoạt động đúng. Integration test: API functions (insertNotification, getNotifications) tương tác đúng với Supabase và Expo Push Service. System test: thông báo được gửi và hiển thị đúng trên thiết bị khi có các sự kiện trigger. Fail nếu thông báo không được gửi, gửi trùng lặp, hoặc hiển thị sai nội dung.
Team-member (Thành viên đội) Module
Unit Test / Integration Test / System Test
Jest (local) + React Native app (iOS/Android Simulator) + Supabase test database
Tester – Nguyễn Đức An
Pass khi ≥ 95% test case đạt kết quả mong đợi. Unit test: các hàm xử lý team member logic hoạt động đúng. Integration test: API functions (getTeamMembers, addTeamMember, removeTeamMember) tương tác đúng với Supabase. System test: luồng quản lý thành viên (xem danh sách, thêm, xóa) hoạt động đúng trên mobile app. Fail nếu dữ liệu không đồng bộ, quyền truy cập sai, hoặc thao tác không được lưu vào database.
Acceptance Test (Final Demo)
System Test / Acceptance Test
React Native app (iOS/Android Simulator hoặc thiết bị thật) + Supabase test database + Stripe test mode
Cả nhóm (3 thành viên)
Pass khi tất cả chức năng chính (Event, Payment, Club, Notification, Team-member) hoạt động đúng; không có bug mức độ nghiêm trọng (Critical) còn tồn tại; tỷ lệ pass ≥ 95%. Fail nếu có lỗi nghiêm trọng gây ngừng hoạt động hệ thống hoặc các chức năng cốt lõi không hoạt động.

8. Công cụ, Kỹ thuật và Phương pháp (Tools, Techniques, and Methodologies)

Bảng sau liệt kê các công cụ, kỹ thuật và phương pháp được sử dụng trong dự án SportHawk:

Công cụ
Mục đích sử dụng
Phạm vi áp dụng
Jest
Framework để viết và chạy unit test và integration test. Sử dụng để test các hàm business logic, utility functions, và API functions với Supabase.
Unit test và Integration test cho tất cả các module (Event, Payment, Club, Notification, Team-member). Test files được lưu trong thư mục `tests/` và `__tests__/`.
React Native với Expo
Framework để phát triển ứng dụng mobile. Sử dụng để chạy ứng dụng trên iOS Simulator và Android Emulator để thực hiện system test.
System test và Manual test trên mobile app. Kiểm tra giao diện, luồng thao tác người dùng, và tích hợp giữa các module.
Supabase
Backend-as-a-Service cung cấp PostgreSQL database, Authentication, Storage. Sử dụng để kiểm tra dữ liệu sau khi test, đảm bảo dữ liệu được lưu và cập nhật đúng.
Integration test và System test. Kiểm tra database operations (CRUD) thông qua Supabase Dashboard và Supabase client trong test code.
Stripe (Test Mode)
Payment gateway để xử lý thanh toán. Sử dụng Stripe test mode để kiểm thử các chức năng thanh toán mà không cần dùng tiền thật.
Integration test và System test cho module Payment. Kiểm tra payment intent creation, webhook processing, và payment status updates.
VSCode
Môi trường lập trình chính. Sử dụng để viết code, viết test code, review mã nguồn, và debug.
Phát triển và kiểm thử. Viết test files, review code, và debug khi test fail.
GitHub
Nền tảng quản lý mã nguồn và version control. Sử dụng để lưu trữ code, quản lý Pull Request, và ghi nhận lỗi (defect tracking) qua GitHub Issues.
Quản lý code, code review qua Pull Request, và quản lý lỗi (defect tracking).
Google Sheets / Microsoft Excel
Công cụ để ghi lại kết quả system test (manual test), theo dõi tiến độ, tạo bảng Test Case Summary, Test Result Summary, và thống kê lỗi.
Báo cáo kết quả kiểm thử định kỳ. Ghi nhận kết quả manual test, test case summary, và defect log.
iOS Simulator / Android Emulator
Môi trường giả lập để chạy ứng dụng mobile trên máy tính. Sử dụng để thực hiện system test và manual test mà không cần thiết bị thật.
System test và Manual test. Chạy ứng dụng và kiểm tra các chức năng trên giao diện mobile.
Expo Go
Ứng dụng để chạy React Native app trên thiết bị thật. Có thể sử dụng để test trên thiết bị thật nếu cần.
Manual test trên thiết bị thật (optional). Kiểm tra ứng dụng hoạt động trên thiết bị iOS/Android thật.
TypeScript
Ngôn ngữ lập trình với type safety. Sử dụng để viết code và test code, giúp phát hiện lỗi sớm trong quá trình phát triển.
Phát triển và kiểm thử. Viết source code và test code với type checking.

9. Phân tích nguyên nhân đề xuất (Causal Analysis Proposed)

9.1 Mục tiêu

Phân tích nguyên nhân lỗi (Causal Analysis) được thực hiện nhằm xác định nguyên nhân gốc (Root Cause) của các lỗi phát sinh trong quá trình kiểm thử hệ thống SportHawk, từ đó đưa ra biện pháp khắc phục và cải tiến quy trình kiểm thử cho các giai đoạn tiếp theo.

Phân tích nguyên nhân giúp:

- Hiểu rõ tại sao lỗi xảy ra, không chỉ phát hiện lỗi.
- Đưa ra biện pháp khắc phục hiệu quả, tránh lỗi tái diễn.
- Cải thiện quy trình kiểm thử và phát triển.
- Học hỏi từ lỗi để nâng cao chất lượng sản phẩm.

  9.2 Quy trình phân tích nguyên nhân

Quy trình được áp dụng cho mọi lỗi được ghi nhận trong giai đoạn kiểm thử chức năng (Functional Test), kiểm thử tích hợp (Integration Test), và kiểm thử hệ thống (System Test).

Bước
Hoạt động
Người chịu trách nhiệm

1. Ghi nhận lỗi
   Ghi lỗi vào file "Defect Tracking.xlsx" (Google Sheets) hoặc GitHub Issues, gồm: mô tả chi tiết lỗi, ảnh minh họa (screenshot nếu là lỗi UI), bước tái hiện lỗi, mức độ nghiêm trọng (Critical/High/Medium/Low), và module bị ảnh hưởng (Event/Payment/Club/Notification/Team-member).
   Tester phát hiện lỗi (Lâm Tiến Dưỡng / Bùi Xuân Đang / Nguyễn Đức An)
2. Phân loại lỗi
   Phân nhóm lỗi theo loại: logic code (business logic sai), giao diện (UI/UX - hiển thị sai, không responsive), cơ sở dữ liệu (Supabase - dữ liệu không được lưu, query sai), API (Supabase API hoặc Stripe API trả lỗi), phân quyền (quyền truy cập sai), hoặc hiệu năng (ứng dụng chậm, crash).
   QA Leader – Lâm Tiến Dưỡng
3. Phân tích nguyên nhân gốc
   Xác định nguyên nhân gốc của lỗi bằng cách đặt câu hỏi "Tại sao?" nhiều lần (5 Whys technique). Ví dụ: Lỗi tính tiền sai → Tại sao? → Hàm tính phí Stripe sai → Tại sao? → Logic tính toán không xử lý edge case → Tại sao? → Thiếu test case cho edge case → Tại sao? → Không review test case đầy đủ.
   QA Leader và Tester phát hiện lỗi
4. Đề xuất biện pháp khắc phục
   Xác định hướng xử lý cụ thể: sửa code (nếu lỗi logic), bổ sung validation (nếu thiếu kiểm tra đầu vào), cập nhật test case (nếu thiếu test case), hoặc cải thiện quy trình (nếu lỗi do quy trình).
   Developer / QA Leader
5. Thực hiện khắc phục và kiểm tra lại
   Thực hiện sửa lỗi, chạy lại test case liên quan để đảm bảo lỗi đã được sửa và không gây ra lỗi mới (regression test).
   Developer / Tester
6. Ghi nhận bài học
   Ghi lại bài học rút ra từ lỗi vào defect log để tránh lỗi tương tự trong tương lai.
   QA Leader

7. Huấn luyện (Training)

   10.1 Mục tiêu

Chương trình đào tạo được thực hiện nhằm đảm bảo tất cả thành viên trong nhóm hiểu rõ quy trình kiểm thử, sử dụng thành thạo công cụ QA, và nắm được các kỹ thuật kiểm thử áp dụng cho dự án SportHawk.

Mục tiêu của hoạt động đào tạo bao gồm:

- Giúp các thành viên nắm được quy trình phát hiện, ghi nhận và báo cáo lỗi.
- Đảm bảo tester sử dụng đúng công cụ và kỹ thuật đã được thống nhất (Jest, React Native, Supabase, Stripe).
- Chuẩn hóa quy trình kiểm thử trong nhóm, tăng hiệu quả phối hợp giữa các thành viên.
- Đảm bảo tất cả thành viên có thể viết test case đúng format và chạy test thành công.

  10.2 Nội dung đào tạo

Chủ đề đào tạo
Công cụ / Kỹ thuật sử dụng
Người hướng dẫn
Mục tiêu đạt được
Quy trình QA và viết Test Case
Jest, TypeScript, Google Sheets
QA Leader – Lâm Tiến Dưỡng
Hướng dẫn cách viết test case bằng Jest (format: describe/it, setup mocks, assertions), cách ghi lỗi vào Google Sheets và GitHub Issues, và lập báo cáo kết quả test.
Kiểm thử API với Supabase
Jest, Supabase client, Supabase Dashboard
Tester – Bùi Xuân Đang
Hướng dẫn cách mock Supabase client trong Jest test, cách test các API functions (create, read, update, delete), và cách kiểm tra dữ liệu trong Supabase Dashboard sau khi test.
Kiểm thử Payment với Stripe
Jest, Stripe test mode, Stripe API
Tester – Bùi Xuân Đang
Hướng dẫn cách test các hàm tính toán payment (paymentCaculationiStripeFee), cách test integration với Stripe API trong test mode, và cách xử lý các trường hợp lỗi từ Stripe.
Kiểm thử React Native Components và System Test
React Native, Expo, iOS Simulator, Android Emulator
Tester – Nguyễn Đức An
Hướng dẫn cách chạy ứng dụng trên simulator/emulator, cách thực hiện system test (manual test) trên mobile app, và cách kiểm tra giao diện và luồng thao tác người dùng.
Quản lý lỗi và theo dõi tiến độ
GitHub Issues, Google Sheets
QA Leader – Lâm Tiến Dưỡng
Hướng dẫn cách ghi nhận bug vào GitHub Issues, gắn nhãn mức độ (Critical, High, Medium, Low), theo dõi trạng thái sửa lỗi, và cập nhật defect log trong Google Sheets.
Kỹ thuật kiểm thử phần mềm
Phân vùng tương đương, giá trị biên, test tiêu cực
Cả nhóm QA thảo luận
Áp dụng kỹ thuật thiết kế test case hiệu quả (equivalence partitioning, boundary value analysis, negative testing), tránh trùng lặp và tăng độ bao phủ test cases.

10.3 Kết quả mong đợi

100% thành viên hiểu và tuân thủ quy trình kiểm thử chung đã được quy định trong SQA Plan.

Các test case được viết thống nhất theo format Jest (describe/it blocks, proper mocks, clear assertions) và được lưu trong thư mục `tests/` hoặc `__tests__/`.

Giảm thiểu sai sót khi ghi nhận lỗi và báo cáo kết quả. Tất cả lỗi được ghi nhận đầy đủ thông tin (mô tả, bước tái hiện, mức độ nghiêm trọng) vào GitHub Issues hoặc Google Sheets.

Đảm bảo hoạt động QA diễn ra thống nhất, liên tục và có tính kế thừa trong toàn bộ dự án. Các thành viên có thể hỗ trợ lẫn nhau khi cần.
