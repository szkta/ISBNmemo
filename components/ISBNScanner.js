"use client";
import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function ISBNScanner({ onDetected }) {
  // スキャン済みかどうかを管理
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    let scanner = null;

    // 少し待ってから初期化（DOM描画待ち）
    const timer = setTimeout(() => {
      // 要素がない場合は何もしない
      if (!document.getElementById("reader")) return;

      try {
        scanner = new Html5QrcodeScanner(
          "reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.0,
            disableFlip: false,
          },
          false // verbose
        );

        scanner.render(
          (decodedText) => {
            // ISBNコード（978~）のみ反応
            if (decodedText.startsWith("978") && decodedText.length === 13) {
              setHasScanned(true); // スキャン済みフラグを立てる
              onDetected(decodedText);
              
              // 成功したら即座に停止を試みる（エラーは無視）
              scanner.clear().catch(() => {}); 
            }
          },
          (errorMessage) => {
            // 読み取り中のエラーは無視
          }
        );
      } catch (e) {
        console.warn("Scanner initialization failed", e);
      }
    }, 100);

    // クリーンアップ関数
    return () => {
      clearTimeout(timer);
      if (scanner) {
        try {
          // 停止時のエラーは全て無視する（これがremoveChildエラーを防ぐ鍵）
          scanner.clear().catch(() => {});
        } catch (e) {
          // 無視
        }
      }
    };
  }, [onDetected]);

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-2 text-center text-gray-800">バーコードを読み取ってください</h2>
      
      {/* 【重要】エラー回避のため、スキャン完了後もこの div を削除せず、
        CSSで隠すだけにします（hiddenクラス）。
        これでライブラリが「削除する要素が見つからない」とパニックになるのを防ぎます。
      */}
      <div id="reader" className={hasScanned ? "hidden" : "block"}></div>

      {hasScanned && (
        <div className="text-center py-4 text-green-600 font-bold">
          読み取り完了！
        </div>
      )}

      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 w-full bg-gray-200 py-2 rounded text-gray-800 hover:bg-gray-300 transition"
      >
        リセット
      </button>
    </div>
  );
}