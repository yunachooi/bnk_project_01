// submit.js - 외화 약관 등록

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('termsForm');
    const fileInput = document.getElementById('fileUpload');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    let previewBtn = null;
    
    submitBtn.addEventListener('click', function() {
        if (validateForm()) {
            submitForm();
        }
    });
    
    cancelBtn.addEventListener('click', function() {
        if (confirm('작성 중인 내용이 있습니다. 취소하시겠습니까?')) {
            window.location.href = '/admin/termsPage';
        }
    });
    
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        
        if (file) {
            const allowedTypes = ['application/pdf', 'application/msword', 
                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                'application/haansofthwp'];
            const allowedExtensions = ['.pdf', '.doc', '.docx', '.hwp'];
            
            const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
            
            if (!allowedExtensions.includes(fileExtension)) {
                alert('현재는 PDF 파일만 업로드 가능합니다.');
                this.value = '';
                removePreviewButton();
                return;
            }
            
            if (file.size > 10 * 1024 * 1024) {
                alert('파일 크기는 10MB 이하만 업로드 가능합니다.');
                this.value = '';
                removePreviewButton();
                return;
            }
            
            if (fileExtension === '.pdf') {
                createPreviewButton(file);
                showFileInfo(file, '선택된 PDF 파일을 미리보기할 수 있습니다.');
            } else {
                removePreviewButton();
                showFileInfo(file, '선택된 파일은 PDF가 아니므로 미리보기가 불가능합니다.');
            }
        } else {
            removePreviewButton();
            hideFileInfo();
        }
    });
    
    function createPreviewButton(file) {
        removePreviewButton();
        
        previewBtn = document.createElement('button');
        previewBtn.type = 'button';
        previewBtn.className = 'btn btn-secondary';
        previewBtn.innerHTML = '📄 미리보기';
        previewBtn.style.marginLeft = '10px';
        previewBtn.style.whiteSpace = 'nowrap';
        previewBtn.onclick = function() {
            openPDFPreview(file);
        };
        
        const container = createFileContainer();
        container.appendChild(previewBtn);
    }
    
    function createFileContainer() {
        let container = fileInput.parentNode.querySelector('.file-input-wrapper');
        
        if (!container) {
            container = document.createElement('div');
            container.className = 'file-input-wrapper';
            container.style.display = 'flex';
            container.style.alignItems = 'center';
            container.style.gap = '10px';
            
            fileInput.parentNode.insertBefore(container, fileInput);
            container.appendChild(fileInput);
        }
        
        return container;
    }
    
    function removePreviewButton() {
        if (previewBtn) {
            previewBtn.remove();
            previewBtn = null;
        }
    }
    
    function openPDFPreview(file) {
        try {
            const url = URL.createObjectURL(file);
            const previewWindow = window.open('', '_blank', 'width=1000,height=800,scrollbars=yes,resizable=yes');
            
            if (previewWindow) {
                previewWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>PDF 미리보기 - ${file.name}</title>
                        <style>
                            body { 
                                margin: 0; 
                                padding: 20px; 
                                font-family: 'Spoqa', 'noto', '돋움', Dotum, Helvetica, AppleGothic, Sans-serif;
                                background: #f8f9fa;
                            }
                            .header { 
                                background: white; 
                                padding: 20px; 
                                border-radius: 8px;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                                margin-bottom: 20px;
                            }
                            .file-info { 
                                margin-bottom: 15px; 
                                color: #495057; 
                                line-height: 1.6;
                            }
                            .file-info strong {
                                color: #2c2c2c;
                            }
                            .warning { 
                                background: #fff3cd; 
                                border: 1px solid #ffeaa7; 
                                padding: 12px; 
                                border-radius: 6px;
                                margin-bottom: 15px;
                                color: #856404;
                            }
                            .btn-close {
                                background: #dc3545;
                                color: white;
                                border-color: #dc3545;
                            }
                            .btn-close:hover {
                                background: #c82333;
                            }
                            iframe { 
                                width: 100%; 
                                height: calc(100vh - 250px); 
                                border: 1px solid #dee2e6; 
                                border-radius: 6px;
                                background: white;
                                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                            }
                            .no-pdf {
                                text-align: center;
                                padding: 40px;
                                background: white;
                                border: 1px solid #dee2e6;
                                border-radius: 6px;
                                color: #6c757d;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h3 style="margin: 0 0 15px 0; color: #2c2c2c;">PDF 미리보기</h3>
                            <div class="file-info">
                                <div><strong>파일명:</strong> ${file.name}</div>
                                <div><strong>파일 크기:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB</div>
                                <div><strong>선택 시간:</strong> ${new Date().toLocaleString('ko-KR')}</div>
                            </div>
                            <div class="warning">
                                ⚠️ 이는 업로드 전 미리보기입니다. 실제 등록을 위해서는 창을 닫고 등록 버튼을 클릭해주세요.
                            </div>
                        </div>
                        
                        <iframe src="${url}" type="application/pdf" id="pdfFrame">
                            <div class="no-pdf">
                                <h4>PDF를 표시할 수 없습니다</h4>
                                <p>브라우저가 PDF 표시를 지원하지 않습니다.</p>
                                <p>창을 닫고 등록을 완료한 후 목록에서 다운로드하실 수 있습니다.</p>
                            </div>
                        </iframe>
                        
                        <script>
                            window.addEventListener('beforeunload', function() {
                                URL.revokeObjectURL('${url}');
                            });
                            
                            const iframe = document.getElementById('pdfFrame');
                            iframe.onload = function() {
                                console.log('PDF 로딩 완료');
                            };
                            
                            iframe.onerror = function() {
                                console.log('PDF 로딩 실패');
                            };
                        <\/script>
                    </body>
                    </html>
                `);
                previewWindow.document.close();
                
                showToast('PDF 미리보기가 새 창에서 열렸습니다.', 'success');
            } else {
                alert('팝업이 차단되었습니다.\n브라우저의 팝업 차단 설정을 해제하고 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('미리보기 오류:', error);
            alert('파일 미리보기 중 오류가 발생했습니다.\n파일이 손상되었거나 지원되지 않는 형식일 수 있습니다.');
        }
    }
    
    function showFileInfo(file, message) {
        hideFileInfo();
        
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-preview-info';
        fileInfo.innerHTML = `
            <div style="background: #e8f5e8; border: 1px solid #c3e6c3; padding: 15px; border-radius: 6px; margin-top: 10px; font-size: 13px;">
                <div style="font-weight: bold; color: #155724; margin-bottom: 8px; display: flex; align-items: center;">
                    선택된 파일 정보
                </div>
                <div style="color: #155724; line-height: 1.4; margin-bottom: 8px;">
                    <div><strong>파일명:</strong> ${file.name}</div>
                    <div><strong>크기:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    <div><strong>형식:</strong> ${file.type || '알 수 없음'}</div>
                    <div><strong>선택 시간:</strong> ${new Date().toLocaleString('ko-KR')}</div>
                </div>
                ${message ? `<div style="color: #0c5460; font-style: italic; border-top: 1px solid #c3e6c3; padding-top: 8px;">💡 ${message}</div>` : ''}
            </div>
        `;
        
        fileInput.parentNode.appendChild(fileInfo);
    }
    
    function hideFileInfo() {
        const existingInfo = document.querySelector('.file-preview-info');
        if (existingInfo) {
            existingInfo.remove();
        }
    }
    
    function showToast(message, type) {
        type = type || 'info';
        
        const existingToast = document.querySelector('.toast-message');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
            border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
            border-radius: 6px;
            padding: 12px 16px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            z-index: 10000;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(function() {
            if (toast && toast.parentNode) {
                toast.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(function() {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }
        }, 3000);
        
        if (!document.querySelector('#toast-animations')) {
            const style = document.createElement('style');
            style.id = 'toast-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    function validateForm() {
        const tname = document.getElementById('tname').value.trim();
        const tinfo = document.getElementById('tinfo').value.trim();
        const file = fileInput.files[0];
        
        if (!tname) {
            alert('약관명을 입력해주세요.');
            document.getElementById('tname').focus();
            return false;
        }
        
        if (tname.length < 2) {
            alert('약관명은 최소 2글자 이상 입력해주세요.');
            document.getElementById('tname').focus();
            return false;
        }
        
        if (!tinfo) {
            alert('약관 설명을 입력해주세요.');
            document.getElementById('tinfo').focus();
            return false;
        }
        
        if (tinfo.length < 10) {
            alert('약관 설명은 최소 10글자 이상 입력해주세요.');
            document.getElementById('tinfo').focus();
            return false;
        }
        
        if (!file) {
            alert('약관 파일을 선택해주세요.');
            fileInput.focus();
            return false;
        }
        
        return true;
    }
    
    function submitForm() {
        const formData = new FormData();
        
        formData.append('tname', document.getElementById('tname').value.trim());
        formData.append('tinfo', document.getElementById('tinfo').value.trim());
        formData.append('file', fileInput.files[0]);
        
        submitBtn.disabled = true;
        submitBtn.textContent = '등록 중...';
        
        fetch('/admin/save/terms', {
            method: 'POST',
            body: formData
        })
        .then(function(response) {
            if (!response.ok) {
                throw new Error('서버 응답 오류');
            }
            return response.json();
        })
        .then(function(data) {
            handleRegistrationSuccess(data);
        })
        .catch(function(error) {
            console.error('Error:', error);
            alert('등록 중 오류가 발생했습니다.\n다시 시도해주세요.');
            showToast('등록 중 오류가 발생했습니다.', 'error');
        })
        .finally(function() {
            submitBtn.disabled = false;
            submitBtn.textContent = '등록';
        });
    }
    
    function handleRegistrationSuccess(data) {
        showToast('✅ 약관이 성공적으로 등록되었습니다!', 'success');
        
        const message = '✅ 약관이 성공적으로 등록되었습니다!\n\n' +
                       '약관명: ' + data.tname + '\n' +
                       '파일명: ' + data.tfilename + '\n' +
                       '등록일: ' + data.tcreatedate + '\n\n' +
                       '새로운 약관을 계속 등록하시겠습니까?';
        
        setTimeout(function() {
            if (confirm(message)) {
                window.location.href = '/admin/termsForm?success=true';
            } else {
                window.location.href = '/admin/termsPage';
            }
        }, 1000);
    }
    
    function resetForm() {
        document.getElementById('termsForm').reset();
        removePreviewButton();
        hideFileInfo();
        document.getElementById('tname').style.borderColor = '';
        document.getElementById('tinfo').style.borderColor = '';
    }
    
    document.getElementById('tname').addEventListener('input', function() {
        const value = this.value.trim();
        if (value.length > 0 && value.length < 2) {
            this.style.borderColor = '#ff6b6b';
        } else {
            this.style.borderColor = '';
        }
    });
    
    document.getElementById('tinfo').addEventListener('input', function() {
        const value = this.value.trim();
        if (value.length > 0 && value.length < 10) {
            this.style.borderColor = '#ff6b6b';
        } else {
            this.style.borderColor = '';
        }
    });
    
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    
    if (success === 'true') {
        showToast('새로운 약관을 등록할 수 있습니다.', 'info');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});