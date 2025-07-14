pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let term1Data = null;
let term2Data = null;
let term1Text = '';
let term2Text = '';

document.addEventListener('DOMContentLoaded', function() {
    const file1Id = getUrlParameter('file1');
    const file2Id = getUrlParameter('file2');
    
    if (!file1Id || !file2Id) {
        alert('오류가 발생하였습니다. 다시 진행해주세요.');
        window.close();
        return;
    }
    
    setupEventListeners();
    
    loadFileData(file1Id, file2Id);
    
    setupScrollSync();
});

function setupEventListeners() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            window.close();
        }
    });
}

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

async function loadFileData(file1Id, file2Id) {
    try {
        const [response1, response2] = await Promise.all([
            fetch(`/admin/find/terms/${file1Id}`),
            fetch(`/admin/find/terms/${file2Id}`)
        ]);

        if (!response1.ok || !response2.ok) {
            throw new Error('파일 정보를 가져올 수 없습니다.');
        }

        term1Data = await response1.json();
        term2Data = await response2.json();

        updateFileInfo();
        await loadContent();
        
        await performComparison();

    } catch (error) {
        console.error('로딩 실패:', error);
        alert('오류가 발생하였습니다. 다시 진행해주세요.');
        window.close();
    }
}

function updateFileInfo() {
    document.getElementById('header1').textContent = term1Data.tname || '파일 1';
    document.getElementById('header2').textContent = term2Data.tname || '파일 2';
    
    document.getElementById('info-header1').innerHTML = formatHeader(term1Data);
    document.getElementById('info-header2').innerHTML = formatHeader(term2Data);
}

function formatHeader(data) {
    let info = data.tfilename || '텍스트 내용';
    info += ' | ' + formatDate(data.tcreatedate);
    return info;
}

function formatDate(dateInput) {
    if (!dateInput) return '';
    
    let date;
    if (Array.isArray(dateInput) && dateInput.length >= 3) {
        date = new Date(dateInput[0], dateInput[1] - 1, dateInput[2]);
    } else {
        date = new Date(dateInput);
    }
    
    return date.toLocaleDateString('ko-KR');
}

async function loadContent() {
    await Promise.all([
        loadFileContent(term1Data, 'content1', 1),
        loadFileContent(term2Data, 'content2', 2)
    ]);
}

async function loadFileContent(data, contentId, fileIndex) {
    const contentDiv = document.getElementById(contentId);
    
    if (data.tpath && data.tfilename) {
        try {
            contentDiv.innerHTML = '<div class="loading-content">PDF 렌더링 중...</div>';
            const extractedText = await renderPDF(data.tpath, contentDiv, data);
            if (fileIndex === 1) {
                term1Text = extractedText;
            } else {
                term2Text = extractedText;
            }
        } catch (error) {
            console.error('PDF 로딩 실패:', error);
            contentDiv.innerHTML = createErrorContent('PDF 로딩 실패', data.tpath);
        }
    } 
    else if (data.tinfo) {
        contentDiv.innerHTML = createTextContent(data);
        if (fileIndex === 1) {
            term1Text = data.tinfo;
        } else {
            term2Text = data.tinfo;
        }
    } 
    else {
        contentDiv.innerHTML = createEmptyContent(data);
    }
}

function createTextContent(data) {
    return `
        <div class="document-page">
            <h1>${data.tname}</h1>
            <div style="white-space: pre-wrap; line-height: 1.6; margin-top: 20px;">
                ${data.tinfo}
            </div>
            <div style="margin-top: 30px; text-align: center; color: #6c757d; font-size: 12px;">
                등록일: ${formatDate(data.tcreatedate)}
            </div>
        </div>
    `;
}

function createEmptyContent(data) {
    return `
        <div class="error-content">
            <h3>내용 없음</h3>
            <p>파일명: ${data.tname}</p>
            <p>등록일: ${formatDate(data.tcreatedate)}</p>
        </div>
    `;
}

function createErrorContent(message, pdfPath) {
    let correctedPath;
    if (pdfPath.startsWith('/termspdf/')) {
        correctedPath = pdfPath;
    } else if (pdfPath.startsWith('/static/termspdf/')) {
        correctedPath = pdfPath.replace('/static/termspdf/', '/termspdf/');
    } else {
        correctedPath = '/termspdf/' + pdfPath.split('/').pop();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-content';
    errorDiv.innerHTML = `
        <h3>${message}</h3>
        <p>PDF 파일을 불러올 수 없습니다.</p>
        <button class="pdf-open-button">새 창에서 PDF 열기</button>
    `;
    
    const button = errorDiv.querySelector('.pdf-open-button');
    button.addEventListener('click', function() {
        window.open(correctedPath, '_blank');
    });
    
    return errorDiv.outerHTML;
}

async function renderPDF(pdfPath, container, data) {
    let fullPath;
    if (pdfPath.startsWith('/termspdf/')) {
        fullPath = pdfPath;
    } else if (pdfPath.startsWith('/static/termspdf/')) {
        fullPath = pdfPath.replace('/static/termspdf/', '/termspdf/');
    } else {
        fullPath = '/termspdf/' + pdfPath.split('/').pop();
    }
    
    console.log('PDF 경로:', fullPath);
    
    const loadingTask = pdfjsLib.getDocument(fullPath);
    const pdf = await loadingTask.promise;
    
    const pageContainer = document.createElement('div');
    pageContainer.className = 'document-page';
    pageContainer.style.textAlign = 'center';
    
    const title = document.createElement('h3');
    title.textContent = data.tname;
    title.style.marginBottom = '20px';
    pageContainer.appendChild(title);
    
    const scale = 1.2;
    let extractedText = '';
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: scale });
        
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        extractedText += pageText + '\n';
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;
        
        if (pageNum > 1) {
            const pageDivider = document.createElement('div');
            pageDivider.style.cssText = `
                height: 1px;
                background: #dee2e6;
                margin: 20px 10%;
                position: relative;
            `;
            
            const pageLabel = document.createElement('span');
            pageLabel.textContent = `Page ${pageNum}`;
            pageLabel.style.cssText = `
                position: absolute;
                top: -10px;
                left: 50%;
                transform: translateX(-50%);
                background: white;
                color: #6c757d;
                padding: 0 10px;
                font-size: 11px;
            `;
            pageDivider.appendChild(pageLabel);
            pageContainer.appendChild(pageDivider);
        }
        
        canvas.style.maxWidth = '100%';
        canvas.style.height = 'auto';
        canvas.style.border = '1px solid #dee2e6';
        canvas.style.marginBottom = pageNum === pdf.numPages ? '0' : '20px';
        canvas.style.display = 'block';
        
        pageContainer.appendChild(canvas);
    }
    
    const pageInfo = document.createElement('div');
    pageInfo.style.marginTop = '15px';
    pageInfo.style.fontSize = '12px';
    pageInfo.style.color = '#6c757d';
    pageInfo.innerHTML = `<p>전체 ${pdf.numPages}페이지 표시</p>`;
    
    const openButton = document.createElement('button');
    openButton.className = 'pdf-open-button';
    openButton.textContent = '새 창에서 PDF 열기';
    openButton.addEventListener('click', function() {
        let correctedPath;
        if (data.tpath.startsWith('/termspdf/')) {
            correctedPath = data.tpath;
        } else if (data.tpath.startsWith('/static/termspdf/')) {
            correctedPath = data.tpath.replace('/static/termspdf/', '/termspdf/');
        } else {
            correctedPath = '/termspdf/' + data.tpath.split('/').pop();
        }
        window.open(correctedPath, '_blank');
    });
    
    pageInfo.appendChild(openButton);
    pageContainer.appendChild(pageInfo);
    
    container.innerHTML = '';
    container.appendChild(pageContainer);
    
    return extractedText;
}

async function performComparison() {
    if (!term1Text || !term2Text) {
        console.log('텍스트 추출이 완료되지 않음');
        return;
    }
    
    console.log('비교 시작...');
    
    showProgress(true);
    updateProgress(10, '텍스트 분석 중...');
    
    const lines1 = splitIntoLines(term1Text);
    const lines2 = splitIntoLines(term2Text);
    
    updateProgress(30, '문장 비교 중...');
    
    const comparison = compareLines(lines1, lines2);
    
    updateProgress(70, '비교 결과 생성 중...');
    
    await displayComparison(comparison);
    
    updateProgress(100, '비교 완료');
    
    setTimeout(() => {
        showProgress(false);
        showStats(true);
    }, 1000);
}

function splitIntoLines(text) {
    return text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
}

function compareLines(lines1, lines2) {
    const result = {
        file1: [],
        file2: []
    };
    
    lines1.forEach((line1, index1) => {
        let bestMatch = null;
        let bestSimilarity = 0;
        let bestIndex = -1;
        
        lines2.forEach((line2, index2) => {
            const similarity = calculateSimilarity(line1, line2);
            if (similarity > bestSimilarity) {
                bestSimilarity = similarity;
                bestMatch = line2;
                bestIndex = index2;
            }
        });
        
        if (bestSimilarity > 0.8) {

            result.file1.push({
                text: line1,
                type: 'same',
                matchIndex: bestIndex
            });
            result.file2.push({
                text: bestMatch,
                type: 'same',
                matchIndex: index1
            });
        } else {
            result.file1.push({
                text: line1,
                type: 'removed',
                matchIndex: -1
            });
        }
    });
    
    lines2.forEach((line2, index2) => {
        const hasMatch = result.file2.some(item => item.matchIndex === index2);
        if (!hasMatch) {
            result.file2.push({
                text: line2,
                type: 'added',
                matchIndex: -1
            });
        }
    });
    
    return result;
}

function calculateSimilarity(str1, str2) {
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
}

async function displayComparison(comparison) {
    const content1 = document.getElementById('content1');
    const content2 = document.getElementById('content2');
    
    const comparisonHtml1 = createComparisonHtml(comparison.file1, term1Data.tname);
    content1.innerHTML = comparisonHtml1;
    
    const comparisonHtml2 = createComparisonHtml(comparison.file2, term2Data.tname);
    content2.innerHTML = comparisonHtml2;
    
    showComparisonStats(comparison);
}

function createComparisonHtml(comparisonData, fileName) {
    const lines = comparisonData.map(item => {
        const className = getComparisonClass(item.type);
        return `<div class="${className}">${escapeHtml(item.text)}</div>`;
    }).join('');
    
    return `
        <div class="document-page">
            <h1>${fileName}</h1>
            <div style="line-height: 1.8; margin-top: 20px;">
                ${lines}
            </div>
            <div style="margin-top: 30px; text-align: center; color: #6c757d; font-size: 12px;">
                비교 결과가 표시되었습니다.
            </div>
        </div>
    `;
}

function getComparisonClass(type) {
    switch(type) {
        case 'added': return 'comparison-added';
        case 'removed': return 'comparison-removed';
        default: return 'comparison-same';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showComparisonStats(comparison) {
    const added = comparison.file2.filter(item => item.type === 'added').length;
    const removed = comparison.file1.filter(item => item.type === 'removed').length;
    
    console.log(`비교 통계 - 추가된 줄: ${added}, 삭제된 줄: ${removed}`);
    
    updateStatsDisplay(added, removed);
}

function showProgress(show) {
    const progressDiv = document.getElementById('comparisonProgress');
    if (progressDiv) {
        progressDiv.style.display = show ? 'block' : 'none';
    }
}

function updateProgress(percent, message) {
    const progressFill = document.getElementById('progressFill');
    const progressDiv = document.getElementById('comparisonProgress');
    
    if (progressFill) {
        progressFill.style.width = percent + '%';
    }
    
    if (progressDiv && message) {
        const messageDiv = progressDiv.querySelector('div');
        if (messageDiv) {
            messageDiv.textContent = message;
        }
    }
}

function showStats(show) {
    const statsDiv = document.getElementById('comparisonStats');
    if (statsDiv) {
        statsDiv.style.display = show ? 'flex' : 'none';
    }
}

function updateStatsDisplay(added, removed) {
    const addedElement = document.getElementById('addedCount');
    const removedElement = document.getElementById('removedCount');
    
    if (addedElement) addedElement.textContent = added;
    if (removedElement) removedElement.textContent = removed;
}

function setupScrollSync() {
    const pdf1 = document.getElementById('pdf1');
    const pdf2 = document.getElementById('pdf2');
    
    if (!pdf1 || !pdf2) return;
    
    pdf1.addEventListener('scroll', function() {
        if (!pdf2.isSyncing) {
            pdf1.isSyncing = true;
            pdf2.scrollTop = this.scrollTop;
            setTimeout(() => { pdf1.isSyncing = false; }, 10);
        }
    });
    
    pdf2.addEventListener('scroll', function() {
        if (!pdf1.isSyncing) {
            pdf2.isSyncing = true;
            pdf1.scrollTop = this.scrollTop;
            setTimeout(() => { pdf2.isSyncing = false; }, 10);
        }
    });
}