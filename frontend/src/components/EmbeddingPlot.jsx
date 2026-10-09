import React, { useState, useEffect } from 'react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
import { Target, Info, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { PinkChibiMonster } from './MonsterIcons';

const Plot = createPlotlyComponent(Plotly);

export default function EmbeddingPlot({ activeModel, highlightedWord, onSelectWord }) {
  const [projectionType, setProjectionType] = useState('pca');
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterBucket, setFilterBucket] = useState('all');
  const [plotError, setPlotError] = useState(false);

  useEffect(() => {
    fetchCoordinates();
  }, [activeModel]);

  const fetchCoordinates = async () => {
    setLoading(true);
    try {
      const data = await api.getCoordinates(activeModel);
      setPoints(data.coordinates || []);
    } catch (err) {
      console.error("Failed to load coordinates:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPoints = points.filter(p => {
    if (filterBucket === 'all') return true;
    return p.freq_bucket === filterBucket;
  });

  const freqPoints = filteredPoints.filter(p => p.freq_bucket === 'frequent');
  const medPoints = filteredPoints.filter(p => p.freq_bucket === 'medium');
  const rarePoints = filteredPoints.filter(p => p.freq_bucket === 'rare');

  const getX = (p) => projectionType === 'pca' ? p.pca_x : p.tsne_x;
  const getY = (p) => projectionType === 'pca' ? p.pca_y : p.tsne_y;

  const createTrace = (pointsList, name, color) => ({
    x: pointsList.map(getX),
    y: pointsList.map(getY),
    text: pointsList.map(p => p.word),
    customdata: pointsList,
    mode: 'markers+text',
    type: 'scatter',
    name: name,
    textposition: 'top center',
    textfont: {
      family: 'Inter, sans-serif',
      size: 12,
      color: '#ffffff',
      weight: 'bold'
    },
    marker: {
      size: pointsList.map(p => Math.max(10, Math.min(26, Math.log2(p.count + 2) * 6))),
      color: color,
      opacity: 0.9,
      line: { color: '#ffffff', width: 2 }
    },
    hovertemplate: `<b>%{text}</b><br>Bucket: %{customdata.freq_bucket}<br>Count: %{customdata.count}<extra></extra>`
  });

  const traces = [
    createTrace(freqPoints, 'Frequent (👑)', '#ff2e93'),
    createTrace(medPoints, 'Medium (🌿)', '#10b981'),
    createTrace(rarePoints, 'Rare (💎)', '#a855f7')
  ];

  const highlightedPoint = points.find(p => p.word === highlightedWord);
  if (highlightedPoint) {
    traces.push({
      x: [getX(highlightedPoint)],
      y: [getY(highlightedPoint)],
      text: [highlightedPoint.word],
      mode: 'markers+text',
      type: 'scatter',
      name: 'Stomped Target 🔥',
      textposition: 'top center',
      textfont: {
        family: 'Inter, sans-serif',
        size: 15,
        color: '#ffab00',
        weight: 'bold'
      },
      marker: {
        size: 28,
        color: '#ff8c00',
        symbol: 'star',
        line: { color: '#ffffff', width: 3 }
      },
      hoverinfo: 'none'
    });
  }

  const layout = {
    autosize: true,
    margin: { l: 40, r: 20, t: 30, b: 40 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(26, 11, 46, 0.7)',
    hoverlabel: {
      bgcolor: '#2e1a47',
      font: { family: 'Inter, sans-serif', size: 12, color: '#ffffff', weight: 'bold' },
      bordercolor: '#ff2e93'
    },
    xaxis: {
      title: projectionType.toUpperCase() + ' Axis 1',
      gridcolor: 'rgba(255, 255, 255, 0.1)',
      zerolinecolor: 'rgba(255, 46, 147, 0.4)',
      tickfont: { color: '#c084fc', weight: 'bold' },
      titlefont: { color: '#f0abfc', size: 12, weight: 'bold' }
    },
    yaxis: {
      title: projectionType.toUpperCase() + ' Axis 2',
      gridcolor: 'rgba(255, 255, 255, 0.1)',
      zerolinecolor: 'rgba(255, 46, 147, 0.4)',
      tickfont: { color: '#c084fc', weight: 'bold' },
      titlefont: { color: '#f0abfc', size: 12, weight: 'bold' }
    },
    legend: {
      orientation: 'h',
      x: 0,
      y: 1.12,
      font: { color: '#ffffff', size: 11, weight: 'bold' }
    }
  };

  const handlePlotClick = (data) => {
    if (data.points && data.points.length > 0) {
      const clickedWord = data.points[0].text;
      if (clickedWord && onSelectWord) {
        onSelectWord(clickedWord);
      }
    }
  };

  // SVG Canvas Fallback if WebGL/Plotly experiences browser issues
  const minX = Math.min(...filteredPoints.map(getX), -1);
  const maxX = Math.max(...filteredPoints.map(getX), 1);
  const minY = Math.min(...filteredPoints.map(getY), -1);
  const maxY = Math.max(...filteredPoints.map(getY), 1);

  const scaleX = (val) => ((val - minX) / (maxX - minX || 1)) * 80 + 10;
  const scaleY = (val) => 90 - ((val - minY) / (maxY - minY || 1)) * 80;

  return (
    <div className="card-squishy p-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-purple-500/30 gap-4 mb-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <PinkChibiMonster className="w-6 h-6" />
            2D Candy Vector Space Map 🗺️
          </h3>
          <p className="text-xs text-purple-200 font-bold mt-0.5">
            Dimensionality reduction projection ({projectionType.toUpperCase()})
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-purple-950 p-1.5 rounded-2xl border-2 border-purple-500/40 shadow-inner">
            <button
              onClick={() => setProjectionType('pca')}
              className={`px-4 py-1.5 text-xs font-black rounded-xl transition-all ${
                projectionType === 'pca'
                  ? 'btn-candy-pink text-white scale-105'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              PCA 2D
            </button>
            <button
              onClick={() => setProjectionType('tsne')}
              className={`px-4 py-1.5 text-xs font-black rounded-xl transition-all ${
                projectionType === 'tsne'
                  ? 'btn-candy-pink text-white scale-105'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              t-SNE 2D
            </button>
          </div>

          <select
            value={filterBucket}
            onChange={(e) => setFilterBucket(e.target.value)}
            className="bg-purple-950 text-white font-bold text-xs py-2 px-3 rounded-2xl border-2 border-purple-500/40 focus:outline-none cursor-pointer"
          >
            <option value="all">All Buckets ({points.length})</option>
            <option value="frequent">Frequent Only 👑</option>
            <option value="medium">Medium Only 🌿</option>
            <option value="rare">Rare Only 💎</option>
          </select>
        </div>
      </div>

      {/* Plot Area */}
      <div className="flex-1 w-full min-h-[420px] relative rounded-3xl overflow-hidden bg-purple-950/70 border-2 border-purple-500/30 shadow-inner">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-purple-200 font-bold text-xs">
            Brewing 2D Vector Map...
          </div>
        ) : !plotError ? (
          <Plot
            data={traces}
            layout={layout}
            config={{ responsive: true, displayModeBar: true, displaylogo: false }}
            onClick={handlePlotClick}
            onError={() => setPlotError(true)}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          /* High Performance Interactive SVG Map Fallback */
          <svg className="w-full h-full p-4">
            {filteredPoints.map((p) => {
              const cx = `${scaleX(getX(p))}%`;
              const cy = `${scaleY(getY(p))}%`;
              const isHighlight = p.word === highlightedWord;
              const color = p.freq_bucket === 'frequent' ? '#ff2e93' : p.freq_bucket === 'medium' ? '#10b981' : '#a855f7';
              return (
                <g key={p.word} onClick={() => onSelectWord && onSelectWord(p.word)} className="cursor-pointer group">
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHighlight ? 12 : 8}
                    fill={isHighlight ? '#ff8c00' : color}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all hover:scale-150"
                  />
                  <text
                    x={cx}
                    y={cy}
                    dy="-12"
                    textAnchor="middle"
                    fill={isHighlight ? '#ffab00' : '#ffffff'}
                    fontSize={isHighlight ? "14" : "11"}
                    fontWeight="bold"
                    fontFamily="Inter, sans-serif"
                  >
                    {p.word}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex items-center justify-between text-xs font-bold text-purple-200 border-t border-purple-500/30 pt-3">
        <span className="flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-pink-400" />
          Click any word node to stomp and explore its nearest neighbors!
        </span>
        {highlightedWord && (
          <span className="text-amber-300 font-mono font-black">
            Stomped: {highlightedWord} 🔥
          </span>
        )}
      </div>
    </div>
  );
}
